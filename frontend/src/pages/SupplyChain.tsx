import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '../components/Button'
import { useBatchHistory, useSupplyChain, useOperatorRole, parseTxError, OPERATOR_HINT_ADDRESS } from '../hooks/useSupplyChain'
import { useWorkflowState } from '../hooks/useProtocolStats'
import { STEP_TYPES, STEP_STATUS } from '../lib/contracts'
import { Package, ChevronRight, CheckCircle, Clock, AlertCircle, XCircle, MinusCircle, ShieldAlert, ShieldCheck } from 'lucide-react'

const OBSERVATION_MAX = 140

export function SupplyChain() {
  const { address, isConnected } = useAccount()
  const { isOperator, isLoading: isRoleLoading, roleResolved, error: roleError } = useOperatorRole(address)
  const [batchInput, setBatchInput] = useState('')
  const [searchBatchId, setSearchBatchId] = useState<number | null>(null)
  const { history, isLoading, refetch } = useBatchHistory(searchBatchId ?? 0, searchBatchId !== null)
  const { data: workflow, isLoading: workflowLoading } = useWorkflowState()

  const { addStep, startStep, completeStep, failStep, isPending, isConfirming, isConfirmed, error } = useSupplyChain()
  const txError = parseTxError(error)
  const hasSearched = searchBatchId !== null
  const batchExists = !!history && history.length > 0
  const batchNotFound = hasSearched && !isLoading && !batchExists
  const canUpdate = isConnected && isOperator && batchExists
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [stepForm, setStepForm] = useState({ stepType: 0, location: '', observation: '' })
  const [actingStepId, setActingStepId] = useState<bigint | null>(null)

  useEffect(() => {
    if (isConfirmed) {
      setShowUpdateForm(false)
      setStepForm({ stepType: 0, location: '', observation: '' })
      setActingStepId(null)
      refetch()
    }
  }, [isConfirmed, refetch])

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchBatchId === null) return
    addStep({
      stepType: Number(stepForm.stepType),
      batchId: searchBatchId,
      location: stepForm.location,
      observation: stepForm.observation,
    })
  }

  const handleStart = (stepId: bigint) => {
    setActingStepId(stepId)
    startStep(stepId)
  }

  const handleComplete = (stepId: bigint) => {
    setActingStepId(stepId)
    completeStep(stepId)
  }

  const handleFail = (stepId: bigint) => {
    const reason = window.prompt('Motivo da falha (opcional):') ?? ''
    setActingStepId(stepId)
    failStep(stepId, reason)
  }

  const formatTime = (ts: bigint) =>
    ts > 0n ? new Date(Number(ts) * 1000).toLocaleString('pt-BR') : ''

  // status: 0 Pendente, 1 Em Progresso, 2 Concluído, 3 Falhou, 4 Pulada
  const getStatusIcon = (status: number) => {
    switch (status) {
      case 2:
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 1:
        return <Clock className="w-5 h-5 text-blue-600" />
      case 3:
        return <XCircle className="w-5 h-5 text-red-600" />
      case 4:
        return <MinusCircle className="w-5 h-5 text-gray-400" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 2:
        return 'bg-green-100 text-green-800'
      case 1:
        return 'bg-blue-100 text-blue-800'
      case 3:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Supply Chain</h1>
        <p className="mt-2 text-gray-600">Rastreamento completo da cadeia de suprimentos de nióbio</p>
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

      {isConnected && !isRoleLoading && roleResolved && !isOperator && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800">Conta sem permissão de operador</h3>
              <p className="text-sm text-amber-700 mt-1">
                A conta conectada (<code className="bg-amber-100 px-1 rounded">{address}</code>) não tem o papel{' '}
                <strong>OPERATOR</strong>, necessário para criar lotes e registrar etapas.
                Conecte a conta operadora do deploy ou peça a um administrador para conceder o papel.
              </p>
              <p className="text-xs text-amber-700 mt-2">Conta operadora padrão (deployer):</p>
              <code className="block mt-1 text-xs bg-amber-100 text-amber-900 rounded px-2 py-1 break-all">
                {OPERATOR_HINT_ADDRESS}
              </code>
            </div>
          </div>
        </div>
      )}

      {isConnected && !isRoleLoading && !roleResolved && roleError && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-orange-600 shrink-0" />
            <div>
              <h3 className="font-medium text-orange-800">Não foi possível verificar a permissão</h3>
              <p className="text-sm text-orange-700 mt-1">
                A leitura do papel <strong>OPERATOR</strong> falhou (provável instabilidade ou limite do
                provedor RPC). Isto <strong>não</strong> significa que sua conta não tem permissão. Aguarde
                alguns segundos e recarregue a página.
              </p>
            </div>
          </div>
        </div>
      )}

      {isConnected && isOperator && (
        <div className="flex items-center gap-2 text-sm text-green-700 mb-6">
          <ShieldCheck className="w-4 h-4" />
          Conta operadora conectada — você pode criar lotes e registrar etapas.
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Buscar Lote</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="number"
              placeholder="ID do Lote"
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <Button onClick={() => setSearchBatchId(batchInput === '' ? null : Number(batchInput))}>
            Buscar
          </Button>
        </div>
      </div>

      {/* Timeline */}
      {searchBatchId !== null && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Timeline do Lote #{searchBatchId}</h2>
            <Button
              onClick={() => setShowUpdateForm((v) => !v)}
              disabled={!canUpdate}
              title={
                !isConnected
                  ? 'Conecte sua carteira'
                  : !isOperator
                    ? 'Sua conta não tem permissão de operador'
                    : !batchExists
                      ? 'Este lote não existe neste contrato'
                      : undefined
              }
            >
              {showUpdateForm ? 'Fechar' : 'Atualizar Etapa'}
            </Button>
          </div>

          {showUpdateForm && (
            <form
              onSubmit={handleAddStep}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-100 rounded-lg p-4 mb-6 bg-gray-50"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Etapa</label>
                <select
                  value={stepForm.stepType}
                  onChange={(e) => setStepForm({ ...stepForm, stepType: Number(e.target.value) })}
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
                  placeholder="Ex: Porto de Santos"
                  value={stepForm.location}
                  onChange={(e) => setStepForm({ ...stepForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                <input
                  type="text"
                  maxLength={OBSERVATION_MAX}
                  placeholder="Observação (opcional)"
                  value={stepForm.observation}
                  onChange={(e) => setStepForm({ ...stepForm, observation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="mt-1 text-xs text-gray-400 text-right">
                  {stepForm.observation.length}/{OBSERVATION_MAX}
                </p>
              </div>
              <div className="md:col-span-3 flex items-center gap-4">
                <Button type="submit" disabled={isPending || isConfirming || !canUpdate}>
                  {isPending ? 'Confirme na carteira...' : isConfirming ? 'Confirmando...' : 'Registrar Etapa'}
                </Button>
                {txError && (
                  <span className="text-sm text-red-600">{txError}</span>
                )}
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Carregando da blockchain...</p>
            </div>
          ) : batchNotFound ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-gray-700 font-medium">Lote #{searchBatchId} não encontrado neste contrato.</p>
              <p className="text-sm text-gray-500 mt-1">
                O contrato foi reimplantado recentemente. Crie um novo lote no Dashboard para começar a rastreá-lo.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(history ?? []).map((step, index) => (
                <div key={step.stepId.toString()} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {getStatusIcon(step.status)}
                    </div>
                    {index < (history?.length ?? 0) - 1 && (
                      <div className="w-0.5 h-16 bg-gray-200 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {STEP_TYPES[step.stepType] ?? `Etapa ${step.stepType}`}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                        {STEP_STATUS[step.status] ?? 'Desconhecido'}
                      </span>
                    </div>
                    {step.location && (
                      <p className="text-sm text-gray-600">Local: {step.location}</p>
                    )}
                    {formatTime(step.startTime) && (
                      <p className="text-sm text-gray-500">Início: {formatTime(step.startTime)}</p>
                    )}
                    {formatTime(step.endTime) && (
                      <p className="text-sm text-gray-500">Fim: {formatTime(step.endTime)}</p>
                    )}
                    {step.metadata && (
                      <p className="mt-2 text-sm text-gray-700 italic border-l-2 border-gray-300 pl-2">
                        Obs.: {step.metadata}
                      </p>
                    )}

                    {(() => {
                      const isStepOperator =
                        !!address && address.toLowerCase() === step.operator.toLowerCase()
                      const isActing = actingStepId === step.stepId && (isPending || isConfirming)
                      const isTerminal = step.status >= 2 // Concluído, Falhou ou Pulada

                      if (!isConnected || !isOperator || isTerminal) return null

                      if (!isStepOperator) {
                        return (
                          <p className="mt-3 text-xs text-gray-400">
                            Apenas o operador que criou esta etapa pode movimentá-la.
                          </p>
                        )
                      }

                      return (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {step.status === 0 && (
                            <Button
                              size="sm"
                              onClick={() => handleStart(step.stepId)}
                              disabled={isActing}
                            >
                              {isActing ? 'Processando...' : 'Iniciar'}
                            </Button>
                          )}
                          {step.status === 1 && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleComplete(step.stepId)}
                                disabled={isActing}
                              >
                                {isActing ? 'Processando...' : 'Concluir'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFail(step.stepId)}
                                disabled={isActing}
                              >
                                Falhar
                              </Button>
                            </>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              ))}
              {txError && actingStepId !== null && (
                <p className="text-sm text-red-600">{txError}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Workflow: lotes por etapa */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Lotes por Etapa do Workflow</h2>
          {workflowLoading && (
            <span className="text-sm text-gray-500">Carregando da blockchain...</span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(workflow ?? []).map((stage) => (
            <div key={stage.stepType} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-800">{stage.label}</span>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                  {stage.batches.length}
                </span>
              </div>
              {stage.batches.length === 0 ? (
                <p className="text-xs text-gray-400 pl-6">Nenhum lote nesta etapa.</p>
              ) : (
                <ul className="space-y-1 pl-6">
                  {stage.batches.map((b) => (
                    <li key={b.batchId.toString()} className="text-xs text-gray-700">
                      <button
                        type="button"
                        className="font-medium text-primary-600 hover:underline"
                        onClick={() => {
                          setBatchInput(b.batchId.toString())
                          setSearchBatchId(Number(b.batchId))
                        }}
                      >
                        Lote #{b.batchId.toString()}
                      </button>
                      <span className="text-gray-400"> — operador </span>
                      <code className="bg-white border border-gray-200 rounded px-1">
                        {`${b.operator.slice(0, 6)}...${b.operator.slice(-4)}`}
                      </code>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        {!workflowLoading && (workflow ?? []).every((s) => s.batches.length === 0) && (
          <p className="text-sm text-gray-500 text-center py-6">
            Nenhum lote registrado ainda. Crie um lote no Dashboard para vê-lo aqui.
          </p>
        )}
      </div>
    </main>
  )
}
