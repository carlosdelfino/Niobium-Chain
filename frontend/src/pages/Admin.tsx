import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { isAddress } from 'viem'
import { Button } from '../components/Button'
import {
  useSupplyChain,
  useAdminRole,
  useOperatorRole,
  parseTxError,
  OPERATOR_HINT_ADDRESS,
} from '../hooks/useSupplyChain'
import { ShieldCheck, ShieldAlert, UserPlus, UserMinus, CheckCircle2 } from 'lucide-react'

export function Admin() {
  const { address, isConnected } = useAccount()
  const { isAdmin, isLoading: isAdminLoading } = useAdminRole(address)
  const { grantOperator, revokeOperator, isPending, isConfirming, isConfirmed, error } = useSupplyChain()
  const txError = parseTxError(error)

  const [targetAddress, setTargetAddress] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const normalized = targetAddress.trim()
  const isValidAddress = isAddress(normalized)

  // Verifica o status de operador do endereço informado (somente quando válido).
  const { isOperator: targetIsOperator, isLoading: isTargetLoading, refetch } = useOperatorRole(
    isValidAddress ? (normalized as `0x${string}`) : undefined,
  )

  useEffect(() => {
    if (isConfirmed) {
      refetch()
    }
  }, [isConfirmed, refetch])

  const handleGrant = () => {
    setValidationError(null)
    if (!isValidAddress) {
      setValidationError('Endereço Ethereum inválido.')
      return
    }
    grantOperator(normalized as `0x${string}`)
  }

  const handleRevoke = () => {
    setValidationError(null)
    if (!isValidAddress) {
      setValidationError('Endereço Ethereum inválido.')
      return
    }
    revokeOperator(normalized as `0x${string}`)
  }

  const isBusy = isPending || isConfirming

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
        <p className="mt-2 text-gray-600">Conceda ou revogue o papel de operador (OPERATOR_ROLE) de outros endereços</p>
      </div>

      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">Conecte sua carteira</h3>
              <p className="text-sm text-yellow-700">Conecte o MetaMask com uma conta administradora para gerenciar permissões.</p>
            </div>
          </div>
        </div>
      )}

      {isConnected && !isAdminLoading && !isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800">Conta sem permissão de administrador</h3>
              <p className="text-sm text-amber-700 mt-1">
                A conta conectada (<code className="bg-amber-100 px-1 rounded">{address}</code>) não tem o papel{' '}
                <strong>DEFAULT_ADMIN</strong>, necessário para conceder ou revogar operadores.
                Conecte a conta administradora do deploy:
              </p>
              <code className="block mt-1 text-xs bg-amber-100 text-amber-900 rounded px-2 py-1 break-all">
                {OPERATOR_HINT_ADDRESS}
              </code>
            </div>
          </div>
        </div>
      )}

      {isConnected && isAdmin && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Gerenciar Operadores</h2>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1">Endereço do operador</label>
          <input
            type="text"
            placeholder="0x..."
            value={targetAddress}
            onChange={(e) => {
              setTargetAddress(e.target.value)
              setValidationError(null)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
          />

          {normalized.length > 0 && !isValidAddress && (
            <p className="mt-1 text-sm text-red-600">Endereço Ethereum inválido.</p>
          )}

          {isValidAddress && !isTargetLoading && (
            <p className="mt-2 text-sm flex items-center gap-1.5">
              {targetIsOperator ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-green-700">Este endereço já é operador.</span>
                </>
              ) : (
                <span className="text-gray-500">Este endereço ainda não é operador.</span>
              )}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Button
              onClick={handleGrant}
              disabled={!isValidAddress || isBusy || targetIsOperator}
              icon={<UserPlus className="w-4 h-4" />}
              title={targetIsOperator ? 'Endereço já é operador' : undefined}
            >
              {isBusy ? 'Processando...' : 'Conceder OPERATOR'}
            </Button>
            <Button
              variant="outline"
              onClick={handleRevoke}
              disabled={!isValidAddress || isBusy || !targetIsOperator}
              icon={<UserMinus className="w-4 h-4" />}
              title={!targetIsOperator ? 'Endereço não é operador' : undefined}
            >
              {isBusy ? 'Processando...' : 'Revogar OPERATOR'}
            </Button>
          </div>

          {validationError && <p className="mt-3 text-sm text-red-600">{validationError}</p>}
          {txError && <p className="mt-3 text-sm text-red-600">{txError}</p>}
          {isConfirmed && (
            <p className="mt-3 text-sm text-green-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Transação confirmada na rede.
            </p>
          )}
        </div>
      )}
    </main>
  )
}
