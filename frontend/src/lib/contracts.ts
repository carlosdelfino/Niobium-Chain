// ABIs dos contratos - alinhadas com os contratos Solidity em /contracts

// Tipos de etapa da cadeia (enum SupplyChain.StepType)
export const STEP_TYPES = [
  'Mineração',
  'Transporte',
  'Processamento',
  'Embalagem',
  'Porto (Carregamento)',
  'Embarque',
  'Porto (Descarregamento)',
  'Transporte Final',
  'Fabricação',
  'Montagem',
  'Entrega',
] as const;

// Status de etapa (enum SupplyChain.StepStatus)
export const STEP_STATUS = [
  'Pendente',
  'Em Progresso',
  'Concluído',
  'Falhou',
  'Pulada',
] as const;

const SUPPLY_CHAIN_STEP_COMPONENTS = [
  { internalType: 'uint256', name: 'stepId', type: 'uint256' },
  { internalType: 'uint8', name: 'stepType', type: 'uint8' },
  { internalType: 'uint8', name: 'status', type: 'uint8' },
  { internalType: 'uint256', name: 'batchId', type: 'uint256' },
  { internalType: 'address', name: 'operator', type: 'address' },
  { internalType: 'uint256', name: 'startTime', type: 'uint256' },
  { internalType: 'uint256', name: 'endTime', type: 'uint256' },
  { internalType: 'string', name: 'location', type: 'string' },
  { internalType: 'string', name: 'qrCodeHash', type: 'string' },
  { internalType: 'string', name: 'cvDataHash', type: 'string' },
  { internalType: 'string', name: 'metadata', type: 'string' },
  { internalType: 'uint256[]', name: 'previousSteps', type: 'uint256[]' },
  { internalType: 'uint256[]', name: 'nextSteps', type: 'uint256[]' },
] as const;

export const SUPPLY_CHAIN_ABI = [
  {
    inputs: [],
    name: 'OPERATOR_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'did', type: 'string' },
      { internalType: 'uint8', name: 'initialStepType', type: 'uint8' },
      { internalType: 'string', name: 'location', type: 'string' },
      { internalType: 'string', name: 'observation', type: 'string' },
    ],
    name: 'createBatch',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'stepType', type: 'uint8' },
      { internalType: 'uint256', name: 'batchId', type: 'uint256' },
      { internalType: 'string', name: 'location', type: 'string' },
      { internalType: 'string', name: 'observation', type: 'string' },
      { internalType: 'uint256[]', name: 'previousSteps', type: 'uint256[]' },
    ],
    name: 'createStep',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'stepId', type: 'uint256' },
      { internalType: 'string', name: 'qrCodeHash', type: 'string' },
    ],
    name: 'startStep',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'stepId', type: 'uint256' },
      { internalType: 'string', name: 'cvDataHash', type: 'string' },
      { internalType: 'string', name: 'metadata', type: 'string' },
    ],
    name: 'completeStep',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'stepId', type: 'uint256' },
      { internalType: 'string', name: 'reason', type: 'string' },
    ],
    name: 'failStep',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'stepId', type: 'uint256' }],
    name: 'skipStep',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'batchId', type: 'uint256' }],
    name: 'getBatchHistory',
    outputs: [
      {
        components: SUPPLY_CHAIN_STEP_COMPONENTS,
        internalType: 'struct SupplyChain.SupplyChainStep[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    // getter automático do mapping `batches` (campos não-array do struct Batch)
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'batches',
    outputs: [
      { internalType: 'uint256', name: 'batchId', type: 'uint256' },
      { internalType: 'string', name: 'did', type: 'string' },
      { internalType: 'uint256', name: 'currentStepId', type: 'uint256' },
      { internalType: 'address', name: 'creator', type: 'address' },
      { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
      { internalType: 'bool', name: 'isActive', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'batchId', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'did', type: 'string' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
    ],
    name: 'BatchCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'stepId', type: 'uint256' },
      { indexed: false, internalType: 'uint8', name: 'stepType', type: 'uint8' },
      { indexed: true, internalType: 'uint256', name: 'batchId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'operator', type: 'address' },
    ],
    name: 'StepCreated',
    type: 'event',
  },
] as const;

export const NIOBIUM_DID_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'batchId', type: 'uint256' },
      { internalType: 'string', name: 'publicKey', type: 'string' },
      { internalType: 'string[]', name: 'authentication', type: 'string[]' },
      { internalType: 'string[]', name: 'serviceEndpoints', type: 'string[]' },
    ],
    name: 'createDID',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const BATTERY_TRACKING_ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'serialNumber', type: 'string' },
      { internalType: 'string', name: 'model', type: 'string' },
      { internalType: 'uint256', name: 'capacity', type: 'uint256' },
      { internalType: 'uint256', name: 'voltage', type: 'uint256' },
      { internalType: 'string', name: 'chemistry', type: 'string' },
      { internalType: 'uint256', name: 'niobiumBatchId', type: 'uint256' },
      { internalType: 'string', name: 'manufacturer', type: 'string' },
      { internalType: 'uint256', name: 'warrantyMonths', type: 'uint256' },
      { internalType: 'string', name: 'qrCode', type: 'string' },
      { internalType: 'string', name: 'tokenURI', type: 'string' },
    ],
    name: 'createBattery',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'batteryId', type: 'uint256' },
      { internalType: 'address', name: 'to', type: 'address' },
    ],
    name: 'transferBattery',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'batteryId', type: 'uint256' },
      { internalType: 'string', name: 'location', type: 'string' },
    ],
    name: 'updateLocation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'batteryId', type: 'uint256' },
      { internalType: 'uint256', name: 'vehicleId', type: 'uint256' },
    ],
    name: 'installInVehicle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'batteryId', type: 'uint256' }],
    name: 'removeFromVehicle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'batteryId', type: 'uint256' }],
    name: 'deactivateBattery',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    // getter automático do mapping `batteries` (Battery não possui campos array)
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'batteries',
    outputs: [
      { internalType: 'uint256', name: 'batteryId', type: 'uint256' },
      { internalType: 'string', name: 'serialNumber', type: 'string' },
      { internalType: 'string', name: 'model', type: 'string' },
      { internalType: 'uint256', name: 'capacity', type: 'uint256' },
      { internalType: 'uint256', name: 'voltage', type: 'uint256' },
      { internalType: 'string', name: 'chemistry', type: 'string' },
      { internalType: 'uint256', name: 'niobiumBatchId', type: 'uint256' },
      { internalType: 'string', name: 'manufacturer', type: 'string' },
      { internalType: 'uint256', name: 'manufacturingDate', type: 'uint256' },
      { internalType: 'uint256', name: 'warrantyExpiry', type: 'uint256' },
      { internalType: 'string', name: 'qrCode', type: 'string' },
      { internalType: 'string', name: 'currentLocation', type: 'string' },
      { internalType: 'address', name: 'currentOwner', type: 'address' },
      { internalType: 'bool', name: 'isActive', type: 'bool' },
      { internalType: 'bool', name: 'inVehicle', type: 'bool' },
      { internalType: 'uint256', name: 'vehicleId', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'batteryId', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'serialNumber', type: 'string' },
      { indexed: false, internalType: 'string', name: 'model', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'niobiumBatchId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'manufacturer', type: 'address' },
    ],
    name: 'BatteryCreated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'getBatteryCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllBatteries',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const VEHICLE_TRACKING_ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'vin', type: 'string' },
      { internalType: 'string', name: 'make', type: 'string' },
      { internalType: 'string', name: 'model', type: 'string' },
      { internalType: 'uint256', name: 'year', type: 'uint256' },
      { internalType: 'string', name: 'vehicleType', type: 'string' },
      { internalType: 'string', name: 'tokenURI', type: 'string' },
    ],
    name: 'createVehicle',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'vehicleId', type: 'uint256' },
      { internalType: 'address', name: 'to', type: 'address' },
    ],
    name: 'transferVehicle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'vehicleId', type: 'uint256' },
      { internalType: 'string', name: 'location', type: 'string' },
    ],
    name: 'updateLocation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'vehicleId', type: 'uint256' },
      { internalType: 'uint256', name: 'batteryId', type: 'uint256' },
    ],
    name: 'addBattery',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'vehicleId', type: 'uint256' },
      { internalType: 'uint256', name: 'batteryId', type: 'uint256' },
    ],
    name: 'removeBattery',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    // getter automático do mapping `vehicles` (omite o array batteryIds)
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'vehicles',
    outputs: [
      { internalType: 'uint256', name: 'vehicleId', type: 'uint256' },
      { internalType: 'string', name: 'vin', type: 'string' },
      { internalType: 'string', name: 'make', type: 'string' },
      { internalType: 'string', name: 'model', type: 'string' },
      { internalType: 'uint256', name: 'year', type: 'uint256' },
      { internalType: 'string', name: 'vehicleType', type: 'string' },
      { internalType: 'string', name: 'currentLocation', type: 'string' },
      { internalType: 'address', name: 'currentOwner', type: 'address' },
      { internalType: 'uint256', name: 'manufacturingDate', type: 'uint256' },
      { internalType: 'bool', name: 'isActive', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'vehicleId', type: 'uint256' }],
    name: 'getVehicleBatteries',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'vehicleId', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'vin', type: 'string' },
      { indexed: false, internalType: 'string', name: 'make', type: 'string' },
      { indexed: false, internalType: 'string', name: 'model', type: 'string' },
      { indexed: true, internalType: 'address', name: 'manufacturer', type: 'address' },
    ],
    name: 'VehicleCreated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'getVehicleCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllVehicles',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const CARBON_CREDIT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'niobiumBatchId', type: 'uint256' },
      { internalType: 'uint256', name: 'co2Avoided', type: 'uint256' },
      { internalType: 'string', name: 'methodology', type: 'string' },
      { internalType: 'string', name: 'uri', type: 'string' },
    ],
    name: 'mintCredit',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'creditId', type: 'uint256' }],
    name: 'verifyCredit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'creditId', type: 'uint256' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'retireCredit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'creditData',
    outputs: [
      { internalType: 'uint256', name: 'niobiumBatchId', type: 'uint256' },
      { internalType: 'uint256', name: 'co2Avoided', type: 'uint256' },
      { internalType: 'string', name: 'methodology', type: 'string' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bool', name: 'verified', type: 'bool' },
      { internalType: 'address', name: 'verifier', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }],
    name: 'uri',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'id', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MINTER_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'AUDITOR_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'creditId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'niobiumBatchId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'co2Avoided', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'recipient', type: 'address' },
    ],
    name: 'CreditMinted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'creditId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'verifier', type: 'address' },
    ],
    name: 'CreditVerified',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'creditId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'retiree', type: 'address' },
    ],
    name: 'CreditRetired',
    type: 'event',
  },
] as const;

// Sanitiza valores de env: secrets do GitHub frequentemente carregam uma
// quebra de linha (\n) ou espaços no final, o que invalida endereços e faz o
// RPC rejeitar com InvalidParamsRpcError. Remove qualquer espaço/quebra.
function cleanEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

// Endereços dos contratos (lidos do .env; fallback = deploy Sepolia)
export const CONTRACT_ADDRESSES = {
  supplyChain: (cleanEnv(import.meta.env.VITE_SUPPLY_CHAIN_ADDRESS) || '0xa8D4C4a0112E3E97f1EEaa3A5049e863DB384835') as `0x${string}`,
  niobiumDID: (cleanEnv(import.meta.env.VITE_NIOBIUM_DID_ADDRESS) || '0x1ce2Ff12db18e690D03A119e212469C697824097') as `0x${string}`,
  batteryTracking: (cleanEnv(import.meta.env.VITE_BATTERY_TRACKING_ADDRESS) || '0xbdC5a2DE14ac2530bC4D8Ca4D8572040F85B2938') as `0x${string}`,
  vehicleTracking: (cleanEnv(import.meta.env.VITE_VEHICLE_TRACKING_ADDRESS) || '0x86fE62cb65C036412dC100035DeacD5A9345D86F') as `0x${string}`,
  carbonCredit: (cleanEnv(import.meta.env.VITE_CARBON_CREDIT_ADDRESS) || '0x9fE08E204266D321fFB50Ed2d198ac2279494d5F') as `0x${string}`,
} as const;

// Bloco a partir do qual buscar eventos (evita varrer toda a chain)
export const DEPLOY_FROM_BLOCK: bigint = cleanEnv(import.meta.env.VITE_DEPLOY_FROM_BLOCK)
  ? BigInt(cleanEnv(import.meta.env.VITE_DEPLOY_FROM_BLOCK)!)
  : 0n;
