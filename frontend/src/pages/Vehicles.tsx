import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { isAddress } from 'viem'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '../components/Button'
import {
  useVehicleTracking,
  useVehicleInfo,
  useVehicleRole,
  useVehicleBatteries,
  VEHICLE_MANUFACTURER_ROLE,
  VEHICLE_OPERATOR_ROLE,
} from '../hooks/useVehicleTracking'
import { parseTxError } from '../hooks/useSupplyChain'
import { Car, ShieldAlert } from 'lucide-react'

export function Vehicles() {
  const { address, isConnected } = useAccount()
  const [vehicleInput, setVehicleInput] = useState('')
  const [searchVehicleId, setSearchVehicleId] = useState<number | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { vehicle, isLoading: vehicleLoading, refetch } = useVehicleInfo(
    searchVehicleId ?? 0,
    searchVehicleId !== null,
  )
  const { batteryIds, refetch: refetchBatteries } = useVehicleBatteries(
    searchVehicleId ?? 0,
    searchVehicleId !== null,
  )
  const {
    createNewVehicle,
    transferVehicle,
    updateVehicleLocation,
    addBattery,
    removeBattery,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  } = useVehicleTracking()
  const { hasRole: isManufacturer } = useVehicleRole(VEHICLE_MANUFACTURER_ROLE, address)
  const { hasRole: isOperator } = useVehicleRole(VEHICLE_OPERATOR_ROLE, address)
  const txError = parseTxError(error)
  const canCreate = isConnected && isManufacturer
  const canOperate = isConnected && isOperator

  useEffect(() => {
    if (isConfirmed) {
      setShowCreateForm(false)
      refetch()
      refetchBatteries()
    }
  }, [isConfirmed, refetch, refetchBatteries])

  const handleUpdateLocation = (vehicleId: bigint) => {
    const location = window.prompt('Nova localização:')
    if (location) updateVehicleLocation(vehicleId, location)
  }

  const handleTransfer = (vehicleId: bigint) => {
    const to = window.prompt('Endereço do novo proprietário (0x...):')
    if (!to) return
    if (!isAddress(to.trim())) {
      window.alert('Endereço Ethereum inválido.')
      return
    }
    transferVehicle(vehicleId, to.trim() as `0x${string}`)
  }

  const handleAddBattery = (vehicleId: bigint) => {
    const batteryId = window.prompt('ID da bateria a adicionar:')
    if (batteryId === null || batteryId === '') return
    const parsed = Number(batteryId)
    if (!Number.isFinite(parsed) || parsed < 0) {
      window.alert('ID de bateria inválido.')
      return
    }
    addBattery(vehicleId, BigInt(parsed))
  }

  const handleRemoveBattery = (vehicleId: bigint, batteryId: bigint) => {
    if (window.confirm(`Remover a bateria #${batteryId.toString()} deste veículo?`)) {
      removeBattery(vehicleId, batteryId)
    }
  }

  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    year: '',
    vehicleType: '',
    tokenURI: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createNewVehicle({
        vin: formData.vin,
        make: formData.make,
        model: formData.model,
        year: Number(formData.year),
        vehicleType: formData.vehicleType,
        tokenURI: formData.tokenURI,
      })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating vehicle:', error)
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Veículos</h1>
          <p className="mt-2 text-gray-600">Registro e rastreamento de veículos elétricos</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={!canCreate}
          title={!isConnected ? 'Conecte sua carteira' : !isManufacturer ? 'Sua conta não tem o papel MANUFACTURER' : undefined}
        >
          Novo Veículo
        </Button>
      </div>

      {isConnected && !isManufacturer && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800">Conta sem permissão de fabricante</h3>
              <p className="text-sm text-amber-700 mt-1">
                A conta conectada não tem o papel <strong>MANUFACTURER</strong>, necessário para criar veículos.
                Peça a um administrador para conceder o papel no contrato VehicleTracking.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="text-yellow-600">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-yellow-800">Conecte sua carteira</h3>
              <p className="text-sm text-yellow-700">Conecte o MetaMask para acessar o sistema completo</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Criar Novo Veículo</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fabricante</label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Veículo</label>
              <input
                type="text"
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Token URI (IPFS)</label>
              <input
                type="text"
                value={formData.tokenURI}
                onChange={(e) => setFormData({ ...formData, tokenURI: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="md:col-span-2 flex gap-4">
              <Button type="submit" disabled={isPending || isConfirming || !canCreate}>
                {isPending ? 'Criando...' : isConfirming ? 'Confirmando...' : 'Criar Veículo'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
              {txError && <span className="text-sm text-red-600 self-center">{txError}</span>}
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Buscar Veículo</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="number"
              placeholder="ID do Veículo"
              value={vehicleInput}
              onChange={(e) => setVehicleInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <Button onClick={() => { setShowQR(false); setSearchVehicleId(vehicleInput === '' ? null : Number(vehicleInput)) }}>
            Buscar
          </Button>
        </div>
      </div>

      {/* Vehicle Details */}
      {searchVehicleId !== null && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          {vehicleLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Carregando da blockchain...</p>
            </div>
          ) : !vehicle ? (
            <p className="text-gray-500 text-center py-8">Veículo #{searchVehicleId} não encontrado.</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Detalhes do Veículo #{searchVehicleId}</h2>
                <Button variant="outline" onClick={() => setShowQR((v) => !v)}>
                  {showQR ? 'Ocultar QR' : 'QR Code'}
                </Button>
              </div>
              {showQR && (
                <div className="flex flex-col items-center mb-6 p-4 bg-gray-50 rounded-lg">
                  <QRCodeSVG value={`niobium-vehicle:${vehicle.vin}`} size={160} />
                  <p className="mt-2 text-sm text-gray-600 break-all text-center">niobium-vehicle:{vehicle.vin}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">VIN</p>
                  <p className="font-medium text-gray-900">{vehicle.vin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fabricante</p>
                  <p className="font-medium text-gray-900">{vehicle.make}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Modelo</p>
                  <p className="font-medium text-gray-900">{vehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ano</p>
                  <p className="font-medium text-gray-900">{vehicle.year.toString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo</p>
                  <p className="font-medium text-gray-900">{vehicle.vehicleType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Localização</p>
                  <p className="font-medium text-gray-900">{vehicle.currentLocation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium text-gray-900">{vehicle.isActive ? 'Ativo' : 'Inativo'}</p>
                </div>
              </div>

              {/* Baterias Instaladas */}
              <div className="mt-6 border-t border-gray-100 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Baterias Instaladas</h3>
                {batteryIds.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma bateria registrada neste veículo.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {batteryIds.map((id) => (
                      <span key={id.toString()} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-800">
                        Bateria #{id.toString()}
                        {canOperate && (
                          <button
                            type="button"
                            disabled={isPending || isConfirming}
                            onClick={() => handleRemoveBattery(vehicle.vehicleId, id)}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            title="Remover bateria do veículo"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Ações do Operador */}
              {canOperate ? (
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Ações</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" disabled={isPending || isConfirming} onClick={() => handleUpdateLocation(vehicle.vehicleId)}>
                      Atualizar Localização
                    </Button>
                    <Button size="sm" variant="outline" disabled={isPending || isConfirming} onClick={() => handleAddBattery(vehicle.vehicleId)}>
                      Adicionar Bateria
                    </Button>
                    <Button size="sm" variant="outline" disabled={isPending || isConfirming} onClick={() => handleTransfer(vehicle.vehicleId)}>
                      Transferir
                    </Button>
                  </div>
                  {(isPending || isConfirming) && (
                    <p className="mt-2 text-sm text-gray-500">{isPending ? 'Confirme na carteira...' : 'Confirmando transação...'}</p>
                  )}
                  {txError && <p className="mt-2 text-sm text-red-600">{txError}</p>}
                </div>
              ) : (
                isConnected && (
                  <p className="mt-6 border-t border-gray-100 pt-6 text-sm text-gray-400">
                    Sua conta não tem o papel OPERATOR neste contrato; ações de movimentação estão indisponíveis.
                  </p>
                )
              )}
            </>
          )}
        </div>
      )}
    </main>
  )
}
