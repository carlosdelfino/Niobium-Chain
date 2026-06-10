import { usePublicClient } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { parseAbiItem, type AbiEvent, type Log } from 'viem'
import { CONTRACT_ADDRESSES, DEPLOY_FROM_BLOCK, STEP_TYPES } from '../lib/contracts'

// Liga logs detalhados quando VITE_DEBUG_RPC=true.
const DEBUG_RPC = import.meta.env.VITE_DEBUG_RPC === 'true'

// Janela máxima de blocos por requisição eth_getLogs. Vários provedores
// públicos limitam o range (ex.: drpc free = 10.000 blocos), retornando HTTP
// 400. Fatiamos o intervalo em janelas seguras para evitar esse erro.
const LOG_CHUNK_SIZE = 9_000n

type PublicClient = NonNullable<ReturnType<typeof usePublicClient>>

/**
 * Busca logs dividindo o intervalo [fromBlock, toBlock] em janelas de no
 * máximo LOG_CHUNK_SIZE blocos, contornando limites de range dos provedores.
 */
async function getLogsChunked(
  client: PublicClient,
  params: { address: `0x${string}`; event: AbiEvent; fromBlock: bigint },
): Promise<Log[]> {
  const latest = await client.getBlockNumber()
  // Se o fromBlock estiver além do head (config incorreta), começa do head.
  const start = params.fromBlock > latest ? latest : params.fromBlock
  const all: Log[] = []

  for (let from = start; from <= latest; from += LOG_CHUNK_SIZE + 1n) {
    const to = from + LOG_CHUNK_SIZE > latest ? latest : from + LOG_CHUNK_SIZE
    try {
      const logs = await client.getLogs({
        address: params.address,
        event: params.event,
        fromBlock: from,
        toBlock: to,
      })
      all.push(...logs)
    } catch (err) {
      console.error('[getLogsChunked] falha na janela', {
        address: params.address,
        event: (params.event as { name?: string }).name,
        fromBlock: from.toString(),
        toBlock: to.toString(),
        error: err,
      })
      throw err
    }
  }

  if (DEBUG_RPC) {
    console.debug('[getLogsChunked]', {
      address: params.address,
      event: (params.event as { name?: string }).name,
      fromBlock: start.toString(),
      toBlock: latest.toString(),
      total: all.length,
    })
  }

  return all
}

const BATCH_CREATED = parseAbiItem(
  'event BatchCreated(uint256 indexed batchId, string did, address indexed creator)',
)
const BATTERY_CREATED = parseAbiItem(
  'event BatteryCreated(uint256 indexed batteryId, string serialNumber, string model, uint256 niobiumBatchId, address indexed manufacturer)',
)
const VEHICLE_CREATED = parseAbiItem(
  'event VehicleCreated(uint256 indexed vehicleId, string vin, string make, string model, address indexed manufacturer)',
)
const STEP_CREATED = parseAbiItem(
  'event StepCreated(uint256 indexed stepId, uint8 stepType, uint256 indexed batchId, address indexed operator)',
)

export interface ActivityItem {
  type: string
  description: string
  blockNumber: bigint
}

export interface ProtocolStats {
  batches: number
  batteries: number
  vehicles: number
  steps: number
  recentActivity: ActivityItem[]
}

export interface WorkflowBatch {
  batchId: bigint
  operator: `0x${string}`
  stepId: bigint
}

export interface WorkflowStage {
  stepType: number
  label: string
  batches: WorkflowBatch[]
}

/**
 * Reconstrói, a partir dos eventos StepCreated, a posição atual de cada lote
 * no workflow (a etapa de maior stepId é a mais recente) e agrupa os lotes por
 * tipo de etapa, indicando o operador responsável por cada um.
 */
export function useWorkflowState() {
  const client = usePublicClient()

  return useQuery<WorkflowStage[]>({
    queryKey: ['workflow-state'],
    enabled: !!client,
    refetchInterval: 60_000,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 2,
    queryFn: async () => {
      if (!client) throw new Error('Public client indisponível')

      const stepLogs = await getLogsChunked(client, {
        address: CONTRACT_ADDRESSES.supplyChain,
        event: STEP_CREATED,
        fromBlock: DEPLOY_FROM_BLOCK,
      })

      // Para cada lote, mantém apenas a etapa mais recente (maior stepId).
      const latestByBatch = new Map<string, WorkflowBatch & { stepType: number }>()
      for (const log of stepLogs) {
        const args = (log as Log & { args: Record<string, unknown> }).args
        const batchId = args.batchId as bigint | undefined
        const stepId = args.stepId as bigint | undefined
        const operator = args.operator as `0x${string}` | undefined
        const stepType = Number(args.stepType ?? 0)
        if (batchId === undefined || stepId === undefined || operator === undefined) continue

        const key = batchId.toString()
        const current = latestByBatch.get(key)
        if (!current || stepId > current.stepId) {
          latestByBatch.set(key, { batchId, stepId, operator, stepType })
        }
      }

      // Inicializa todas as etapas do workflow (mesmo as vazias).
      const stages: WorkflowStage[] = STEP_TYPES.map((label, stepType) => ({
        stepType,
        label,
        batches: [],
      }))

      for (const entry of latestByBatch.values()) {
        const stage = stages[entry.stepType]
        if (stage) {
          stage.batches.push({ batchId: entry.batchId, operator: entry.operator, stepId: entry.stepId })
        }
      }

      for (const stage of stages) {
        stage.batches.sort((a, b) => (a.batchId > b.batchId ? 1 : -1))
      }

      return stages
    },
  })
}

export function useProtocolStats() {
  const client = usePublicClient()

  return useQuery<ProtocolStats>({
    queryKey: ['protocol-stats'],
    enabled: !!client,
    refetchInterval: 60_000,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 2,
    queryFn: async () => {
      if (!client) throw new Error('Public client indisponível')

      const fromBlock = DEPLOY_FROM_BLOCK
      const [batchLogs, batteryLogs, vehicleLogs, stepLogs] = await Promise.all([
        getLogsChunked(client, { address: CONTRACT_ADDRESSES.supplyChain, event: BATCH_CREATED, fromBlock }),
        getLogsChunked(client, { address: CONTRACT_ADDRESSES.batteryTracking, event: BATTERY_CREATED, fromBlock }),
        getLogsChunked(client, { address: CONTRACT_ADDRESSES.vehicleTracking, event: VEHICLE_CREATED, fromBlock }),
        getLogsChunked(client, { address: CONTRACT_ADDRESSES.supplyChain, event: STEP_CREATED, fromBlock }),
      ])

      const argsOf = (l: Log) => (l as Log & { args: Record<string, unknown> }).args

      const recentActivity: ActivityItem[] = [
        ...batchLogs.map((l) => ({
          type: 'Lote Criado',
          description: `Lote #${(argsOf(l).batchId as bigint | undefined)?.toString()} (${argsOf(l).did ?? '—'})`,
          blockNumber: l.blockNumber ?? 0n,
        })),
        ...batteryLogs.map((l) => ({
          type: 'Bateria Registrada',
          description: `Bateria #${(argsOf(l).batteryId as bigint | undefined)?.toString()} — ${argsOf(l).model ?? ''}`,
          blockNumber: l.blockNumber ?? 0n,
        })),
        ...vehicleLogs.map((l) => ({
          type: 'Veículo Registrado',
          description: `Veículo #${(argsOf(l).vehicleId as bigint | undefined)?.toString()} — VIN ${argsOf(l).vin ?? ''}`,
          blockNumber: l.blockNumber ?? 0n,
        })),
        ...stepLogs.map((l) => ({
          type: 'Etapa Criada',
          description: `Etapa #${(argsOf(l).stepId as bigint | undefined)?.toString()} — ${STEP_TYPES[Number(argsOf(l).stepType ?? 0)] ?? 'Etapa'}`,
          blockNumber: l.blockNumber ?? 0n,
        })),
      ]
        .sort((a, b) => (b.blockNumber > a.blockNumber ? 1 : -1))
        .slice(0, 8)

      return {
        batches: batchLogs.length,
        batteries: batteryLogs.length,
        vehicles: vehicleLogs.length,
        steps: stepLogs.length,
        recentActivity,
      }
    },
  })
}
