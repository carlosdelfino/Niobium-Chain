import { usePublicClient } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { parseAbiItem } from 'viem'
import { CONTRACT_ADDRESSES, DEPLOY_FROM_BLOCK, STEP_TYPES } from '../lib/contracts'

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

      const stepLogs = await client.getLogs({
        address: CONTRACT_ADDRESSES.supplyChain,
        event: STEP_CREATED,
        fromBlock: DEPLOY_FROM_BLOCK,
      })

      // Para cada lote, mantém apenas a etapa mais recente (maior stepId).
      const latestByBatch = new Map<string, WorkflowBatch & { stepType: number }>()
      for (const log of stepLogs) {
        const batchId = log.args.batchId
        const stepId = log.args.stepId
        const operator = log.args.operator
        const stepType = Number(log.args.stepType ?? 0)
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
        client.getLogs({ address: CONTRACT_ADDRESSES.supplyChain, event: BATCH_CREATED, fromBlock }),
        client.getLogs({ address: CONTRACT_ADDRESSES.batteryTracking, event: BATTERY_CREATED, fromBlock }),
        client.getLogs({ address: CONTRACT_ADDRESSES.vehicleTracking, event: VEHICLE_CREATED, fromBlock }),
        client.getLogs({ address: CONTRACT_ADDRESSES.supplyChain, event: STEP_CREATED, fromBlock }),
      ])

      const recentActivity: ActivityItem[] = [
        ...batchLogs.map((l) => ({
          type: 'Lote Criado',
          description: `Lote #${l.args.batchId?.toString()} (${l.args.did ?? '—'})`,
          blockNumber: l.blockNumber ?? 0n,
        })),
        ...batteryLogs.map((l) => ({
          type: 'Bateria Registrada',
          description: `Bateria #${l.args.batteryId?.toString()} — ${l.args.model ?? ''}`,
          blockNumber: l.blockNumber ?? 0n,
        })),
        ...vehicleLogs.map((l) => ({
          type: 'Veículo Registrado',
          description: `Veículo #${l.args.vehicleId?.toString()} — VIN ${l.args.vin ?? ''}`,
          blockNumber: l.blockNumber ?? 0n,
        })),
        ...stepLogs.map((l) => ({
          type: 'Etapa Criada',
          description: `Etapa #${l.args.stepId?.toString()} — ${STEP_TYPES[Number(l.args.stepType ?? 0)] ?? 'Etapa'}`,
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
