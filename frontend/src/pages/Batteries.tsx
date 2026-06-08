import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { isAddress } from 'viem'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '../components/Button'
import {
  useBatteryTracking,
  useBatteryInfo,
  useBatteryRole,
  useAllBatteries,
  useBatteryCount,
  BATTERY_MANUFACTURER_ROLE,
  BATTERY_OPERATOR_ROLE,
} from '../hooks/useBatteryTracking'
import { parseTxError } from '../hooks/useSupplyChain'
import { Battery, ShieldAlert } from 'lucide-react'

export function Batteries() {
  const { address, isConnected } = useAccount()
  const [batteryInput, setBatteryInput] = useState('')
  const [searchBatteryId, setSearchBatteryId] = useState<number | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { battery, isLoading: batteryLoading, refetch } = useBatteryInfo(
    searchBatteryId ?? 0,
    searchBatteryId !== null,
  )
  const { batteryIds, isLoading: allBatteriesLoading, refetch: refetchAll } = useAllBatteries(isConnected)
  const { count } = useBatteryCount(isConnected)
  const {
    createNewBattery,
    transferBattery,
    updateBatteryLocation,
    installInVehicle,
    removeFromVehicle,
    deactivateBattery,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  } = useBatteryTracking()
  const { hasRole: isManufacturer } = useBatteryRole(BATTERY_MANUFACTURER_ROLE, address)
  const { hasRole: isOperator } = useBatteryRole(BATTERY_OPERATOR_ROLE, address)
  const txError = parseTxError(error)
  const canCreate = isConnected && isManufacturer
  const canOperate = isConnected && isOperator

  useEffect(() => {
    if (isConfirmed) {
      setShowCreateForm(false)
      refetch()
      refetchAll()
    }
  }, [isConfirmed, refetch, refetchAll])

  const handleUpdateLocation = (batteryId: bigint) => {
    const location = window.prompt('Nova localização:')
    if (location) updateBatteryLocation(batteryId, location)
  }

  const handleTransfer = (batteryId: bigint) => {
    const to = window.prompt('Endereço do novo proprietário (0x...):')
    if (!to) return
    if (!isAddress(to.trim())) {
      window.alert('Endereço Ethereum inválido.')
      return
    }
    transferBattery(batteryId, to.trim() as `0x${string}`)
  }

  const handleInstall = (batteryId: bigint) => {
    const vehicleId = window.prompt('ID do veículo onde instalar:')
    if (vehicleId === null || vehicleId === '') return
    const parsed = Number(vehicleId)
    if (!Number.isFinite(parsed) || parsed < 0) {
      window.alert('ID de veículo inválido.')
      return
    }
    installInVehicle(batteryId, BigInt(parsed))
  }

  const handleRemoveFromVehicle = (batteryId: bigint) => {
    if (window.confirm('Remover esta bateria do veículo?')) removeFromVehicle(batteryId)
  }

  const handleDeactivate = (batteryId: bigint) => {
    if (window.confirm('Desativar permanentemente esta bateria (fim de vida útil)?')) {
      deactivateBattery(batteryId)
    }
  }

  const [formData, setFormData] = useState({
    serialNumber: '',
    model: '',
    capacity: '',
    voltage: '',
    chemistry: '',
    niobiumBatchId: '',
    manufacturer: '',
    warrantyMonths: '',
    qrCode: '',
    tokenURI: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createNewBattery({
        serialNumber: formData.serialNumber,
        model: formData.model,
        capacity: Number(formData.capacity),
        voltage: Number(formData.voltage),
        chemistry: formData.chemistry,
        niobiumBatchId: Number(formData.niobiumBatchId),
        manufacturer: formData.manufacturer,
        warrantyMonths: Number(formData.warrantyMonths),
        qrCode: formData.qrCode,
        tokenURI: formData.tokenURI,
      })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating battery:', error)
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Baterias</h1>
          <p className="mt-2 text-gray-600">Rastreamento individual de baterias</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={!canCreate}
          title={!isConnected ? 'Conecte sua carteira' : !isManufacturer ? 'Sua conta não tem o papel MANUFACTURER' : undefined}
        >
          Nova Bateria
        </Button>
      </div>

      {isConnected && !isManufacturer && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800">Conta sem permissão de fabricante</h3>
              <p className="text-sm text-amber-700 mt-1">
                A conta conectada não tem o papel <strong>MANUFACTURER</strong>, necessário para criar baterias.
                Peça a um administrador para conceder o papel no contrato BatteryTracking.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="text-yellow-600">
              <Battery className="w-6 h-6" />
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Criar Nova Bateria</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Série</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade (kWh)</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voltagem (V)</label>
              <input
                type="number"
                value={formData.voltage}
                onChange={(e) => setFormData({ ...formData, voltage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Química</label>
              <input
                type="text"
                value={formData.chemistry}
                onChange={(e) => setFormData({ ...formData, chemistry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID do Lote de Nióbio</label>
              <input
                type="number"
                value={formData.niobiumBatchId}
                onChange={(e) => setFormData({ ...formData, niobiumBatchId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fabricante</label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Garantia (meses)</label>
              <input
                type="number"
                value={formData.warrantyMonths}
                onChange={(e) => setFormData({ ...formData, warrantyMonths: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">QR Code</label>
              <input
                type="text"
                value={formData.qrCode}
                onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="md:col-span-2">
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
                {isPending ? 'Criando...' : isConfirming ? 'Confirmando...' : 'Criar Bateria'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
              {txError && <span className="text-sm text-red-600 self-center">{txError}</span>}
            </div>
          </form>
        </div>
      )}

      {/* All Batteries List */}
      {isConnected && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Todas as Baterias ({count.toString()})
            </h2>
            <Button variant="outline" size="sm" onClick={() => refetchAll()}>
              Atualizar
            </Button>
          </div>
          {allBatteriesLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Carregando baterias...</p>
            </div>
          ) : batteryIds.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma bateria registrada.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batteryIds.map((id) => (
                <div
                  key={id.toString()}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => { setShowQR(false); setSearchBatteryId(Number(id)); setBatteryInput(id.toString()); }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Bateria #{id.toString()}</p>
                      <p className="text-sm text-gray-500">Clique para ver detalhes</p>
                    </div>
                    <Battery className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Buscar Bateria</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="number"
              placeholder="ID da Bateria"
              value={batteryInput}
              onChange={(e) => setBatteryInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <Button onClick={() => { setShowQR(false); setSearchBatteryId(batteryInput === '' ? null : Number(batteryInput)) }}>
            Buscar
          </Button>
        </div>
      </div>

      {/* Battery Details */}
      {searchBatteryId !== null && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          {batteryLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Carregando da blockchain...</p>
            </div>
          ) : !battery ? (
            <p className="text-gray-500 text-center py-8">Bateria #{searchBatteryId} não encontrada.</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Detalhes da Bateria #{searchBatteryId}</h2>
                <Button variant="outline" onClick={() => setShowQR((v) => !v)}>
                  {showQR ? 'Ocultar QR' : 'QR Code'}
                </Button>
              </div>
              {showQR && (
                <div className="flex flex-col items-center mb-6 p-4 bg-gray-50 rounded-lg">
                  <QRCodeSVG value={battery.qrCode || `niobium-battery:${searchBatteryId}`} size={160} />
                  <p className="mt-2 text-sm text-gray-600 break-all text-center">{battery.qrCode || `niobium-battery:${searchBatteryId}`}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Número de Série</p>
                  <p className="font-medium text-gray-900">{battery.serialNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Modelo</p>
                  <p className="font-medium text-gray-900">{battery.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Capacidade</p>
                  <p className="font-medium text-gray-900">{battery.capacity.toString()} kWh</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Voltagem</p>
                  <p className="font-medium text-gray-900">{battery.voltage.toString()} V</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Química</p>
                  <p className="font-medium text-gray-900">{battery.chemistry}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fabricante</p>
                  <p className="font-medium text-gray-900">{battery.manufacturer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Localização Atual</p>
                  <p className="font-medium text-gray-900">{battery.currentLocation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lote de Nióbio</p>
                  <p className="font-medium text-gray-900">#{battery.niobiumBatchId.toString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Instalada em Veículo</p>
                  <p className="font-medium text-gray-900">{battery.inVehicle ? `Veículo #${battery.vehicleId.toString()}` : 'Não'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium text-gray-900">{battery.isActive ? 'Ativa' : 'Inativa'}</p>
                </div>
              </div>

              {/* Ações do Operador */}
              {canOperate ? (
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Ações</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" disabled={isPending || isConfirming} onClick={() => handleUpdateLocation(battery.batteryId)}>
                      Atualizar Localização
                    </Button>
                    {!battery.inVehicle ? (
                      <Button size="sm" variant="outline" disabled={isPending || isConfirming} onClick={() => handleInstall(battery.batteryId)}>
                        Instalar em Veículo
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled={isPending || isConfirming} onClick={() => handleRemoveFromVehicle(battery.batteryId)}>
                        Remover do Veículo
                      </Button>
                    )}
                    <Button size="sm" variant="outline" disabled={isPending || isConfirming || battery.inVehicle} onClick={() => handleTransfer(battery.batteryId)} title={battery.inVehicle ? 'Não é possível transferir bateria instalada em veículo' : undefined}>
                      Transferir
                    </Button>
                    <Button size="sm" variant="ghost" disabled={isPending || isConfirming || !battery.isActive} onClick={() => handleDeactivate(battery.batteryId)}>
                      Desativar
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
