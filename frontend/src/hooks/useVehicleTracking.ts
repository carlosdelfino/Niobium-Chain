import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { keccak256, toBytes } from 'viem'
import { VEHICLE_TRACKING_ABI, CONTRACT_ADDRESSES } from '../lib/contracts'

// Papéis do contrato VehicleTracking (AccessControl da OpenZeppelin).
export const VEHICLE_MANUFACTURER_ROLE = keccak256(toBytes('MANUFACTURER_ROLE'))
export const VEHICLE_OPERATOR_ROLE = keccak256(toBytes('OPERATOR_ROLE'))

/**
 * Verifica se uma conta possui um papel no contrato VehicleTracking.
 */
export function useVehicleRole(role: `0x${string}`, account?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.vehicleTracking,
    abi: VEHICLE_TRACKING_ABI,
    functionName: 'hasRole',
    args: [role, (account ?? '0x0000000000000000000000000000000000000000') as `0x${string}`],
    query: { enabled: !!account },
  })
  return { hasRole: data === true, isLoading, refetch }
}

/**
 * Lê os IDs das baterias instaladas em um veículo.
 */
export function useVehicleBatteries(vehicleId: number, enabled = true) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.vehicleTracking,
    abi: VEHICLE_TRACKING_ABI,
    functionName: 'getVehicleBatteries',
    args: [BigInt(Number.isFinite(vehicleId) ? vehicleId : 0)],
    query: { enabled: enabled && Number.isFinite(vehicleId) && vehicleId >= 0 },
  })
  return { batteryIds: (data ?? []) as readonly bigint[], isLoading, refetch }
}

export function useVehicleTracking() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const createNewVehicle = async (params: {
    vin: string
    make: string
    model: string
    year: number
    vehicleType: string
    tokenURI: string
  }) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.vehicleTracking,
        abi: VEHICLE_TRACKING_ABI,
        functionName: 'createVehicle',
        args: [
          params.vin,
          params.make,
          params.model,
          BigInt(params.year),
          params.vehicleType,
          params.tokenURI,
        ] as const,
      })
    } catch (error) {
      console.error('Error creating vehicle:', error)
      throw error
    }
  }

  const transferVehicle = (vehicleId: bigint, to: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESSES.vehicleTracking,
      abi: VEHICLE_TRACKING_ABI,
      functionName: 'transferVehicle',
      args: [vehicleId, to] as const,
    })
  }

  const updateVehicleLocation = (vehicleId: bigint, location: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.vehicleTracking,
      abi: VEHICLE_TRACKING_ABI,
      functionName: 'updateLocation',
      args: [vehicleId, location] as const,
    })
  }

  const addBattery = (vehicleId: bigint, batteryId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.vehicleTracking,
      abi: VEHICLE_TRACKING_ABI,
      functionName: 'addBattery',
      args: [vehicleId, batteryId] as const,
    })
  }

  const removeBattery = (vehicleId: bigint, batteryId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.vehicleTracking,
      abi: VEHICLE_TRACKING_ABI,
      functionName: 'removeBattery',
      args: [vehicleId, batteryId] as const,
    })
  }

  return {
    createNewVehicle,
    transferVehicle,
    updateVehicleLocation,
    addBattery,
    removeBattery,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export interface VehicleInfo {
  vehicleId: bigint
  vin: string
  make: string
  model: string
  year: bigint
  vehicleType: string
  currentLocation: string
  currentOwner: `0x${string}`
  manufacturingDate: bigint
  isActive: boolean
}

export function useVehicleInfo(vehicleId: number, enabled = true) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.vehicleTracking,
    abi: VEHICLE_TRACKING_ABI,
    functionName: 'vehicles',
    args: [BigInt(Number.isFinite(vehicleId) ? vehicleId : 0)],
    query: { enabled: enabled && Number.isFinite(vehicleId) && vehicleId >= 0 },
  })

  const vehicle: VehicleInfo | undefined = data
    ? {
        vehicleId: data[0],
        vin: data[1],
        make: data[2],
        model: data[3],
        year: data[4],
        vehicleType: data[5],
        currentLocation: data[6],
        currentOwner: data[7],
        manufacturingDate: data[8],
        isActive: data[9],
      }
    : undefined

  const exists = !!vehicle && vehicle.vin.length > 0

  return {
    vehicle: exists ? vehicle : undefined,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Busca todos os IDs de veículos registrados
 */
export function useAllVehicles(enabled = true) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.vehicleTracking,
    abi: VEHICLE_TRACKING_ABI,
    functionName: 'getAllVehicles',
    query: { enabled },
  })

  return {
    vehicleIds: (data ?? []) as readonly bigint[],
    isLoading,
    error,
    refetch,
  }
}

/**
 * Busca o total de veículos registrados
 */
export function useVehicleCount(enabled = true) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.vehicleTracking,
    abi: VEHICLE_TRACKING_ABI,
    functionName: 'getVehicleCount',
    query: { enabled },
  })

  return {
    count: data ?? 0n,
    isLoading,
    error,
    refetch,
  }
}
