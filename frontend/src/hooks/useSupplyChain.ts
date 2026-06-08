import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { keccak256, toBytes } from 'viem'
import { SUPPLY_CHAIN_ABI, CONTRACT_ADDRESSES } from '../lib/contracts'

// Hash do papel OPERATOR_ROLE no AccessControl da OpenZeppelin:
// keccak256("OPERATOR_ROLE"). Calculado localmente para evitar uma leitura RPC.
export const OPERATOR_ROLE = keccak256(toBytes('OPERATOR_ROLE'))

// DEFAULT_ADMIN_ROLE no AccessControl da OpenZeppelin é o bytes32 zero.
// Quem tem este papel pode conceder/revogar OPERATOR_ROLE a outras contas.
export const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000' as const

// Endereço que recebe os papéis no deploy (deployer). Útil para orientar o
// usuário sobre qual conta precisa estar conectada para movimentar lotes.
export const OPERATOR_HINT_ADDRESS = '0x66682BBeD9e540017967692cCdd069fE5F833888'

/**
 * Converte erros de transação (viem/wagmi/MetaMask) em mensagens claras em PT-BR.
 */
export function parseTxError(error: unknown): string | null {
  if (!error) return null
  const raw =
    (typeof error === 'object' && error !== null && 'shortMessage' in error
      ? String((error as { shortMessage?: unknown }).shortMessage)
      : '') || (error instanceof Error ? error.message : String(error))
  const msg = raw.toLowerCase()

  if (msg.includes('user rejected') || msg.includes('user denied')) {
    return 'Transação cancelada na carteira.'
  }
  if (msg.includes('gas limit too high') || msg.includes('intrinsic gas') || msg.includes('exceeds block gas limit')) {
    return 'A transação reverteria na rede (provável falta de permissão OPERATOR ou lote inexistente neste contrato), por isso a carteira aplicou gás máximo. Verifique se você está com a conta operadora conectada e se o lote existe.'
  }
  if (msg.includes('accesscontrol') || msg.includes('missing role') || msg.includes('is missing role')) {
    return 'Sua conta não tem o papel OPERATOR necessário para esta ação.'
  }
  if (msg.includes('batch does not exist') || msg.includes('batch nao existe') || msg.includes('not active') || msg.includes('inactive')) {
    return 'Este lote não existe ou não está ativo neste contrato. Crie um novo lote no Dashboard.'
  }
  if (msg.includes('429') || msg.includes('rate limit') || msg.includes('too many request')) {
    return 'O provedor RPC está limitando as requisições (429). Aguarde alguns segundos e tente novamente.'
  }
  if (msg.includes('insufficient funds')) {
    return 'Saldo de ETH insuficiente para pagar o gás.'
  }
  // Mensagem curta do viem costuma ser legível o suficiente.
  return raw.split('\n')[0] || 'Falha na transação.'
}

/**
 * Verifica se uma conta possui o papel OPERATOR_ROLE no contrato SupplyChain.
 */
export function useOperatorRole(account?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.supplyChain,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'hasRole',
    args: [OPERATOR_ROLE, (account ?? '0x0000000000000000000000000000000000000000') as `0x${string}`],
    query: { enabled: !!account },
  })

  return {
    isOperator: data === true,
    isLoading,
    refetch,
  }
}

/**
 * Verifica se uma conta possui o papel DEFAULT_ADMIN_ROLE no contrato SupplyChain.
 * Somente um admin pode conceder/revogar OPERATOR_ROLE a outras contas.
 */
export function useAdminRole(account?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.supplyChain,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'hasRole',
    args: [DEFAULT_ADMIN_ROLE, (account ?? '0x0000000000000000000000000000000000000000') as `0x${string}`],
    query: { enabled: !!account },
  })

  return {
    isAdmin: data === true,
    isLoading,
    refetch,
  }
}

export interface SupplyChainStepData {
  stepId: bigint
  stepType: number
  status: number
  batchId: bigint
  operator: `0x${string}`
  startTime: bigint
  endTime: bigint
  location: string
  qrCodeHash: string
  cvDataHash: string
  metadata: string
  previousSteps: readonly bigint[]
  nextSteps: readonly bigint[]
}

export function useSupplyChain() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const createNewBatch = (params: {
    did: string
    initialStepType: number
    location: string
    observation?: string
  }) => {
    writeContract({
      address: CONTRACT_ADDRESSES.supplyChain,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'createBatch',
      args: [params.did, params.initialStepType, params.location, params.observation ?? ''] as const,
    })
  }

  const addStep = (params: {
    stepType: number
    batchId: number
    location: string
    observation?: string
    previousSteps?: number[]
  }) => {
    writeContract({
      address: CONTRACT_ADDRESSES.supplyChain,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'createStep',
      args: [
        params.stepType,
        BigInt(params.batchId),
        params.location,
        params.observation ?? '',
        (params.previousSteps ?? []).map((s) => BigInt(s)),
      ] as const,
    })
  }

  const grantOperator = (account: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESSES.supplyChain,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'grantRole',
      args: [OPERATOR_ROLE, account] as const,
    })
  }

  const revokeOperator = (account: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESSES.supplyChain,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'revokeRole',
      args: [OPERATOR_ROLE, account] as const,
    })
  }

  // Inicia uma etapa: PENDENTE -> EM PROGRESSO.
  const startStep = (stepId: bigint, qrCodeHash = '') => {
    writeContract({
      address: CONTRACT_ADDRESSES.supplyChain,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'startStep',
      args: [stepId, qrCodeHash] as const,
    })
  }

  // Conclui uma etapa: EM PROGRESSO -> CONCLUÍDO.
  const completeStep = (stepId: bigint, metadata = '', cvDataHash = '') => {
    writeContract({
      address: CONTRACT_ADDRESSES.supplyChain,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'completeStep',
      args: [stepId, cvDataHash, metadata] as const,
    })
  }

  // Marca uma etapa como falha: EM PROGRESSO -> FALHOU.
  const failStep = (stepId: bigint, reason = '') => {
    writeContract({
      address: CONTRACT_ADDRESSES.supplyChain,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'failStep',
      args: [stepId, reason] as const,
    })
  }

  // Pula uma etapa (requer ADMIN_ROLE): PENDENTE -> PULADA.
  const skipStep = (stepId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.supplyChain,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'skipStep',
      args: [stepId] as const,
    })
  }

  return {
    createNewBatch,
    addStep,
    grantOperator,
    revokeOperator,
    startStep,
    completeStep,
    failStep,
    skipStep,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export function useBatchHistory(batchId: number, enabled = true) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.supplyChain,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'getBatchHistory',
    args: [BigInt(Number.isFinite(batchId) ? batchId : 0)],
    query: { enabled: enabled && Number.isFinite(batchId) && batchId >= 0 },
  })

  return {
    history: data as readonly SupplyChainStepData[] | undefined,
    isLoading,
    error,
    refetch,
  }
}
