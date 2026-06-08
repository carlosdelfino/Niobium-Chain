import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { keccak256, toBytes } from 'viem'
import { BATTERY_TRACKING_ABI, CONTRACT_ADDRESSES } from '../lib/contracts'

// Papéis do contrato BatteryTracking (AccessControl da OpenZeppelin).
export const BATTERY_MANUFACTURER_ROLE = keccak256(toBytes('MANUFACTURER_ROLE'))
export const BATTERY_OPERATOR_ROLE = keccak256(toBytes('OPERATOR_ROLE'))

/**
 * Verifica se uma conta possui um papel no contrato BatteryTracking.
 */
export function useBatteryRole(role: `0x${string}`, account?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.batteryTracking,
    abi: BATTERY_TRACKING_ABI,
    functionName: 'hasRole',
    args: [role, (account ?? '0x0000000000000000000000000000000000000000') as `0x${string}`],
    query: { enabled: !!account },
  })
  return { hasRole: data === true, isLoading, refetch }
}

export function useBatteryTracking() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const createNewBattery = async (params: {
    serialNumber: string
    model: string
    capacity: number
    voltage: number
    chemistry: string
    niobiumBatchId: number
    manufacturer: string
    warrantyMonths: number
    qrCode: string
    tokenURI: string
  }) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.batteryTracking,
        abi: BATTERY_TRACKING_ABI,
        functionName: 'createBattery',
        args: [
          params.serialNumber,
          params.model,
          BigInt(params.capacity),
          BigInt(params.voltage),
          params.chemistry,
          BigInt(params.niobiumBatchId),
          params.manufacturer,
          BigInt(params.warrantyMonths),
          params.qrCode,
          params.tokenURI,
        ] as const,
      })
    } catch (error) {
      console.error('Error creating battery:', error)
      throw error
    }
  }

  const transferBattery = (batteryId: bigint, to: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESSES.batteryTracking,
      abi: BATTERY_TRACKING_ABI,
      functionName: 'transferBattery',
      args: [batteryId, to] as const,
    })
  }

  const updateBatteryLocation = (batteryId: bigint, location: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.batteryTracking,
      abi: BATTERY_TRACKING_ABI,
      functionName: 'updateLocation',
      args: [batteryId, location] as const,
    })
  }

  const installInVehicle = (batteryId: bigint, vehicleId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.batteryTracking,
      abi: BATTERY_TRACKING_ABI,
      functionName: 'installInVehicle',
      args: [batteryId, vehicleId] as const,
    })
  }

  const removeFromVehicle = (batteryId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.batteryTracking,
      abi: BATTERY_TRACKING_ABI,
      functionName: 'removeFromVehicle',
      args: [batteryId] as const,
    })
  }

  const deactivateBattery = (batteryId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.batteryTracking,
      abi: BATTERY_TRACKING_ABI,
      functionName: 'deactivateBattery',
      args: [batteryId] as const,
    })
  }

  return {
    createNewBattery,
    transferBattery,
    updateBatteryLocation,
    installInVehicle,
    removeFromVehicle,
    deactivateBattery,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export interface BatteryInfo {
  batteryId: bigint
  serialNumber: string
  model: string
  capacity: bigint
  voltage: bigint
  chemistry: string
  niobiumBatchId: bigint
  manufacturer: string
  manufacturingDate: bigint
  warrantyExpiry: bigint
  qrCode: string
  currentLocation: string
  currentOwner: `0x${string}`
  isActive: boolean
  inVehicle: boolean
  vehicleId: bigint
}

export function useBatteryInfo(batteryId: number, enabled = true) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.batteryTracking,
    abi: BATTERY_TRACKING_ABI,
    functionName: 'batteries',
    args: [BigInt(Number.isFinite(batteryId) ? batteryId : 0)],
    query: { enabled: enabled && Number.isFinite(batteryId) && batteryId >= 0 },
  })

  // O getter do mapping retorna uma tupla de valores; mapeamos para objeto.
  const battery: BatteryInfo | undefined = data
    ? {
        batteryId: data[0],
        serialNumber: data[1],
        model: data[2],
        capacity: data[3],
        voltage: data[4],
        chemistry: data[5],
        niobiumBatchId: data[6],
        manufacturer: data[7],
        manufacturingDate: data[8],
        warrantyExpiry: data[9],
        qrCode: data[10],
        currentLocation: data[11],
        currentOwner: data[12],
        isActive: data[13],
        inVehicle: data[14],
        vehicleId: data[15],
      }
    : undefined

  // Uma bateria inexistente retorna serialNumber vazio (struct default).
  const exists = !!battery && battery.serialNumber.length > 0

  return {
    battery: exists ? battery : undefined,
    isLoading,
    error,
    refetch,
  }
}
