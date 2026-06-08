import { useEffect, useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { Button } from '../components/Button'
import { useSupplyChain, useOperatorRole, parseTxError, OPERATOR_HINT_ADDRESS } from '../hooks/useSupplyChain'
import { useProtocolStats } from '../hooks/useProtocolStats'
import { STEP_TYPES } from '../lib/contracts'
import { Package, Battery, Car, TrendingUp, ShieldAlert, AlertTriangle } from 'lucide-react'

export function Dashboard() {
  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const { isOperator, isLoading: isRoleLoading, contractMissing } = useOperatorRole(address)
  const { createNewBatch, isPending, isConfirming, isConfirmed, error } = useSupplyChain()
  const txError = parseTxError(error)
  const canCreate = isConnected && isOperator
  const { data: protocol, isLoading: statsLoading, refetch } = useProtocolStats()
  const wrongNetwork = chain?.id !== sepolia.id

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [batchForm, setBatchForm] = useState({ did: '', initialStepType: 0, location: '', observation: '' })

  useEffect(() => {
    if (isConfirmed) {
      setShowCreateForm(false)
      refetch()
    }
  }, [isConfirmed, refetch])

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault()
    createNewBatch({
      did: batchForm.did || `did:niobium:${Date.now()}`,
      initialStepType: Number(batchForm.initialStepType),
      location: batchForm.location,
      observation: batchForm.observation,
    })
  }

  const stats = [
    { label: 'Lotes Criados', value: protocol?.batches ?? 0, icon: Package, color: 'text-blue-600' },
    { label: 'Baterias Rastreadas', value: protocol?.batteries ?? 0, icon: Battery, color: 'text-green-600' },
    { label: 'Veículos Registrados', value: protocol?.vehicles ?? 0, icon: Car, color: 'text-purple-600' },
    { label: 'Etapas Criadas', value: protocol?.steps ?? 0, icon: TrendingUp, color: 'text-orange-600' },
  ]

  const recentActivity = protocol?.recentActivity ?? []

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Visão geral do sistema de rastreabilidade de nióbio</p>
      </div>

      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="text-yellow-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-yellow-800">Conecte sua carteira</h3>
              <p className="text-sm text-yellow-700">Conecte o MetaMask para acessar o sistema completo</p>
            </div>
          </div>
        </div>
      )}

      {isConnected && contractMissing && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800">Contrato SupplyChain não encontrado</h3>
              <p className="text-sm text-red-700 mt-1">
                O contrato SupplyChain não existe na rede atual. Isso geralmente acontece quando:
              </p>
              <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
                <li>Você ainda não fez o deploy na mainnet</li>
                <li>Está na rede errada (deve ser Sepolia)</li>
                <li>O endereço do contrato está incorreto</li>
              </ul>
              {wrongNetwork && (
                <div className="mt-4">
                  <Button
                    onClick={() => switchChain({ chainId: sepolia.id })}
                    variant="destructive"
                    size="sm"
                    icon={<AlertTriangle className="w-4 h-4" />}
                  >
                    Mudar para Sepolia
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isConnected && !isRoleLoading && !contractMissing && !isOperator && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800">Conta sem permissão de operador</h3>
              <p className="text-sm text-amber-700 mt-1">
                A conta conectada (<code className="bg-amber-100 px-1 rounded">{address}</code>) não tem o papel{' '}
                <strong>OPERATOR</strong>. Conecte a conta operadora do deploy para criar lotes:
              </p>
              <code className="block mt-1 text-xs bg-amber-100 text-amber-900 rounded px-2 py-1 break-all">
                {OPERATOR_HINT_ADDRESS}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Ações Rápidas</h2>
          <Button
            onClick={() => setShowCreateForm((v) => !v)}
            disabled={!canCreate}
            title={!isConnected ? 'Conecte sua carteira' : !isOperator ? 'Sua conta não tem permissão de operador' : undefined}
          >
            {showCreateForm ? 'Fechar' : 'Criar Novo Lote'}
          </Button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateBatch} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DID (opcional)</label>
              <input
                type="text"
                placeholder="did:niobium:..."
                value={batchForm.did}
                onChange={(e) => setBatchForm({ ...batchForm, did: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etapa Inicial</label>
              <select
                value={batchForm.initialStepType}
                onChange={(e) => setBatchForm({ ...batchForm, initialStepType: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {STEP_TYPES.map((label, idx) => (
                  <option key={label} value={idx}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
              <input
                type="text"
                placeholder="Ex: Mina de Araxá"
                value={batchForm.location}
                onChange={(e) => setBatchForm({ ...batchForm, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
              <input
                type="text"
                maxLength={140}
                placeholder="Observação (opcional)"
                value={batchForm.observation}
                onChange={(e) => setBatchForm({ ...batchForm, observation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-xs text-gray-400 text-right">{batchForm.observation.length}/140</p>
            </div>
            <div className="md:col-span-3 flex items-center gap-4">
              <Button type="submit" disabled={isPending || isConfirming || !canCreate}>
                {isPending ? 'Confirme na carteira...' : isConfirming ? 'Confirmando...' : 'Criar Lote'}
              </Button>
              {txError && (
                <span className="text-sm text-red-600">{txError}</span>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente (on-chain)</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{activity.type}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>
              <span className="text-sm text-gray-500">bloco #{activity.blockNumber.toString()}</span>
            </div>
          ))}
          {statsLoading && (
            <p className="text-gray-500 text-center py-8">Carregando eventos da blockchain...</p>
          )}
          {!statsLoading && recentActivity.length === 0 && (
            <p className="text-gray-500 text-center py-8">Nenhuma atividade registrada ainda</p>
          )}
        </div>
      </div>
    </main>
  )
}
