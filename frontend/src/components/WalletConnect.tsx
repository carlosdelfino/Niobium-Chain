import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { Button } from './Button'
import { Wallet, LogOut, AlertTriangle } from 'lucide-react'

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  if (isConnected && address) {
    const wrongNetwork = chain?.id !== sepolia.id
    return (
      <div className="flex items-center gap-3">
        {wrongNetwork && (
          <Button
            onClick={() => switchChain({ chainId: sepolia.id })}
            variant="destructive"
            size="sm"
            icon={<AlertTriangle className="w-4 h-4" />}
          >
            Mudar para Sepolia
          </Button>
        )}
        <div className="text-sm text-gray-600">
          <span className="font-medium">{address.slice(0, 6)}...{address.slice(-4)}</span>
          <span className="ml-2 text-xs text-gray-400">({chain?.name ?? 'rede desconhecida'})</span>
        </div>
        <Button
          onClick={() => disconnect()}
          variant="outline"
          size="sm"
          icon={<LogOut className="w-4 h-4" />}
        >
          Desconectar
        </Button>
      </div>
    )
  }

  // Em wagmi v2 os conectores não expõem `ready`; pode haver duplicados (injected).
  const uniqueConnectors = connectors.filter(
    (c, i, arr) => arr.findIndex((x) => x.name === c.name) === i,
  )

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {uniqueConnectors.map((connector) => (
          <Button
            key={connector.uid}
            onClick={() => connect({ connector })}
            disabled={isPending}
            icon={<Wallet className="w-4 h-4" />}
          >
            {isPending ? 'Conectando...' : `Conectar ${connector.name}`}
          </Button>
        ))}
      </div>
      {error && (
        <span className="text-xs text-red-600 max-w-xs truncate" title={error.message}>
          {error.message}
        </span>
      )}
    </div>
  )
}
