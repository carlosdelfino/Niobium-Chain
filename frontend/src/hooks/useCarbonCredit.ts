import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { keccak256, toBytes } from 'viem'
import { CARBON_CREDIT_ABI, CONTRACT_ADDRESSES } from '../lib/contracts'

// Papéis do contrato CarbonCredit (AccessControl da OpenZeppelin).
export const CARBON_MINTER_ROLE = keccak256(toBytes('MINTER_ROLE'))
export const CARBON_ADMIN_ROLE = keccak256(toBytes('ADMIN_ROLE'))
export const CARBON_AUDITOR_ROLE = keccak256(toBytes('AUDITOR_ROLE'))

/**
 * Verifica se uma conta possui um papel no contrato CarbonCredit.
 */
export function useCarbonRole(role: `0x${string}`, account?: `0x${string}`) {
  const { data, isLoading, refetch, error } = useReadContract({
    address: CONTRACT_ADDRESSES.carbonCredit,
    abi: CARBON_CREDIT_ABI,
    functionName: 'hasRole',
    args: [role, (account ?? '0x0000000000000000000000000000000000000000') as `0x${string}`],
    query: { enabled: !!account },
  })

  // Detecta se o contrato não existe (erro de contrato não implantado)
  const contractMissing = error && (
    error.message.includes('contract not deployed') ||
    error.message.includes('contract not found') ||
    error.message.includes('no contract at address') ||
    error.message.includes('execution reverted') ||
    (error as any).data?.code === -32000 ||
    (error as any).code === 'CALL_EXCEPTION'
  )

  return { hasRole: data === true, isLoading, refetch, contractMissing }
}

export function useCarbonCredit() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const mintNewCredit = async (params: {
    to: `0x${string}`
    niobiumBatchId: number
    co2Avoided: number
    methodology: string
    uri: string
  }) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.carbonCredit,
        abi: CARBON_CREDIT_ABI,
        functionName: 'mintCredit',
        args: [
          params.to,
          BigInt(params.niobiumBatchId),
          BigInt(params.co2Avoided),
          params.methodology,
          params.uri,
        ] as const,
      })
    } catch (error) {
      console.error('Error minting carbon credit:', error)
      throw error
    }
  }

  const verifyCredit = (creditId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.carbonCredit,
      abi: CARBON_CREDIT_ABI,
      functionName: 'verifyCredit',
      args: [creditId] as const,
    })
  }

  const retireCredit = (creditId: bigint, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.carbonCredit,
      abi: CARBON_CREDIT_ABI,
      functionName: 'retireCredit',
      args: [creditId, amount] as const,
    })
  }

  return {
    mintNewCredit,
    verifyCredit,
    retireCredit,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export interface CarbonCreditData {
  niobiumBatchId: bigint
  co2Avoided: bigint
  methodology: string
  timestamp: bigint
  verified: boolean
  verifier: `0x${string}`
}

export function useCreditData(creditId: number, enabled = true) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.carbonCredit,
    abi: CARBON_CREDIT_ABI,
    functionName: 'creditData',
    args: [BigInt(Number.isFinite(creditId) ? creditId : 0)],
    query: { enabled: enabled && Number.isFinite(creditId) && creditId >= 0 },
  })

  // O getter do mapping retorna uma tupla de valores; mapeamos para objeto.
  const credit: CarbonCreditData | undefined = data
    ? {
        niobiumBatchId: data[0],
        co2Avoided: data[1],
        methodology: data[2],
        timestamp: data[3],
        verified: data[4],
        verifier: data[5],
      }
    : undefined

  // Um crédito inexistente retorna co2Avoided = 0 (struct default).
  const exists = !!credit && credit.co2Avoided > 0n

  return {
    credit: exists ? credit : undefined,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Busca o saldo de créditos de carbono de uma conta para um ID específico
 */
export function useCreditBalance(account?: `0x${string}`, creditId?: number, enabled = true) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.carbonCredit,
    abi: CARBON_CREDIT_ABI,
    functionName: 'balanceOf',
    args: [
      (account ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
      BigInt(creditId ?? 0),
    ],
    query: { enabled: enabled && !!account && Number.isFinite(creditId) && (creditId ?? -1) >= 0 },
  })

  return {
    balance: data ?? 0n,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Busca a URI de metadados de um crédito
 */
export function useCreditURI(creditId: number, enabled = true) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.carbonCredit,
    abi: CARBON_CREDIT_ABI,
    functionName: 'uri',
    args: [BigInt(Number.isFinite(creditId) ? creditId : 0)],
    query: { enabled: enabled && Number.isFinite(creditId) && creditId >= 0 },
  })

  return {
    uri: data ?? '',
    isLoading,
    error,
    refetch,
  }
}
