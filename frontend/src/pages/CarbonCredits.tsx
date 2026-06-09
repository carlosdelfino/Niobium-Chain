import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { isAddress } from 'viem'
import { Button } from '../components/Button'
import {
  useCarbonCredit,
  useCreditData,
  useCreditBalance,
  useCarbonRole,
  CARBON_MINTER_ROLE,
  CARBON_AUDITOR_ROLE,
  CARBON_ADMIN_ROLE,
} from '../hooks/useCarbonCredit'
import { Leaf, CheckCircle2, AlertCircle, Plus, ShieldCheck, Flame, TrendingUp } from 'lucide-react'

export function CarbonCredits() {
  const { address, isConnected } = useAccount()
  const { isMinter, isAuditor, isLoading: roleLoading } = useCarbonRoles(address)
  const { mintNewCredit, verifyCredit, retireCredit, isPending, isConfirming, isConfirmed, error } = useCarbonCredit()
  const txError = parseTxError(error)

  // Form state para mint
  const [mintForm, setMintForm] = useState({
    to: '',
    niobiumBatchId: '',
    co2Avoided: '',
    methodology: 'ISO 14064',
    uri: '',
  })

  // Form state para verify/retire
  const [creditId, setCreditId] = useState('')
  const [retireAmount, setRetireAmount] = useState('')

  // Credit data display
  const { credit, refetch: refetchCredit } = useCreditData(
    creditId ? parseInt(creditId) : -1,
    !!creditId && parseInt(creditId) >= 0
  )

  const { balance, refetch: refetchBalance } = useCreditBalance(
    address,
    creditId ? parseInt(creditId) : -1,
    !!address && !!creditId && parseInt(creditId) >= 0
  )

  useEffect(() => {
    if (isConfirmed) {
      refetchCredit()
      refetchBalance()
    }
  }, [isConfirmed, refetchCredit, refetchBalance])

  const handleMint = () => {
    if (!isAddress(mintForm.to)) {
      alert('Endereço inválido')
      return
    }
    if (!mintForm.niobiumBatchId || !mintForm.co2Avoided) {
      alert('Preencha todos os campos obrigatórios')
      return
    }
    mintNewCredit({
      to: mintForm.to as `0x${string}`,
      niobiumBatchId: parseInt(mintForm.niobiumBatchId),
      co2Avoided: parseInt(mintForm.co2Avoided),
      methodology: mintForm.methodology,
      uri: mintForm.uri || `ipfs://QmExample${Date.now()}`,
    })
  }

  const handleVerify = () => {
    if (!creditId) {
      alert('Informe o ID do crédito')
      return
    }
    verifyCredit(BigInt(parseInt(creditId)))
  }

  const handleRetire = () => {
    if (!creditId || !retireAmount) {
      alert('Informe o ID do crédito e a quantidade')
      return
    }
    retireCredit(BigInt(parseInt(creditId)), BigInt(parseInt(retireAmount)))
  }

  const isBusy = isPending || isConfirming

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Leaf className="w-8 h-8 text-green-600" />
          Créditos de Carbono
        </h1>
        <p className="mt-2 text-gray-600">
          Tokenize e gerencie créditos de carbono gerados pela eficiência do nióbio na cadeia de suprimentos
        </p>
      </div>

      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">Conecte sua carteira</h3>
              <p className="text-sm text-yellow-700">Conecte o MetaMask para interagir com os créditos de carbono.</p>
            </div>
          </div>
        </div>
      )}

      {isConnected && !roleLoading && !isMinter && !isAuditor && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-800">Visualização de Créditos</h3>
              <p className="text-sm text-blue-700">
                Você não tem permissões de minter ou auditor, mas pode visualizar créditos existentes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Créditos</p>
              <p className="text-2xl font-bold text-gray-900">{credit ? credit.co2Avoided.toString() : '0'} tCO2</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Status de Verificação</p>
              <p className="text-2xl font-bold text-gray-900">
                {credit?.verified ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-5 h-5" /> Verificado
                  </span>
                ) : (
                  <span className="text-yellow-600">Pendente</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Seu Saldo</p>
              <p className="text-2xl font-bold text-gray-900">{balance.toString()} créditos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mint Form */}
        {isConnected && isMinter && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Criar Novo Crédito</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço do Destinatário</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={mintForm.to}
                  onChange={(e) => setMintForm({ ...mintForm, to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID do Lote de Nióbio</label>
                <input
                  type="number"
                  placeholder="0"
                  value={mintForm.niobiumBatchId}
                  onChange={(e) => setMintForm({ ...mintForm, niobiumBatchId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CO2 Evitado (toneladas)</label>
                <input
                  type="number"
                  placeholder="100"
                  value={mintForm.co2Avoided}
                  onChange={(e) => setMintForm({ ...mintForm, co2Avoided: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metodologia</label>
                <select
                  value={mintForm.methodology}
                  onChange={(e) => setMintForm({ ...mintForm, methodology: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ISO 14064">ISO 14064</option>
                  <option value="GHG Protocol">GHG Protocol</option>
                  <option value="CDM">CDM</option>
                  <option value="VCS">VCS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URI dos Metadados (IPFS)</label>
                <input
                  type="text"
                  placeholder="ipfs://Qm..."
                  value={mintForm.uri}
                  onChange={(e) => setMintForm({ ...mintForm, uri: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                />
              </div>

              <Button
                onClick={handleMint}
                disabled={isBusy}
                icon={<Plus className="w-4 h-4" />}
              >
                {isBusy ? 'Processando...' : 'Criar Crédito'}
              </Button>
            </div>
          </div>
        )}

        {/* Verify/Retire Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Verificar e Aposentar Créditos</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID do Crédito</label>
              <input
                type="number"
                placeholder="0"
                value={creditId}
                onChange={(e) => setCreditId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {credit && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Lote de Nióbio:</span>
                  <span className="text-sm font-medium">{credit.niobiumBatchId.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">CO2 Evitado:</span>
                  <span className="text-sm font-medium">{credit.co2Avoided.toString()} tCO2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Metodologia:</span>
                  <span className="text-sm font-medium">{credit.methodology}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status:</span>
                  <span className={`text-sm font-medium ${credit.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {credit.verified ? 'Verificado' : 'Pendente'}
                  </span>
                </div>
                {credit.verified && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Verificador:</span>
                    <span className="text-sm font-mono">{credit.verifier.slice(0, 6)}...{credit.verifier.slice(-4)}</span>
                  </div>
                )}
              </div>
            )}

            {isConnected && isAuditor && !credit?.verified && credit && (
              <Button
                onClick={handleVerify}
                disabled={isBusy}
                icon={<ShieldCheck className="w-4 h-4" />}
              >
                {isBusy ? 'Processando...' : 'Verificar Crédito'}
              </Button>
            )}

            {isConnected && credit?.verified && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade para Aposentar</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={retireAmount}
                    onChange={(e) => setRetireAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleRetire}
                  disabled={isBusy}
                  icon={<Flame className="w-4 h-4" />}
                >
                  {isBusy ? 'Processando...' : 'Aposentar Crédito'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {txError && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{txError}</p>
        </div>
      )}

      {isConfirmed && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Transação confirmada na rede.
          </p>
        </div>
      )}
    </main>
  )
}

function useCarbonRoles(address?: `0x${string}`) {
  const { hasRole: isMinter, isLoading: minterLoading } = useCarbonRole(CARBON_MINTER_ROLE, address)
  const { hasRole: isAuditor, isLoading: auditorLoading } = useCarbonRole(CARBON_AUDITOR_ROLE, address)
  const { hasRole: isAdmin, isLoading: adminLoading } = useCarbonRole(CARBON_ADMIN_ROLE, address)

  return {
    isMinter: isMinter || isAdmin,
    isAuditor: isAuditor || isAdmin,
    isLoading: minterLoading || auditorLoading || adminLoading,
  }
}

function parseTxError(error: any): string | null {
  if (!error) return null
  if (error.message) return error.message
  if (error.shortMessage) return error.shortMessage
  return 'Erro desconhecido na transação'
}
