import { createConfig, fallback, http } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

// Opções compartilhadas: agrupa chamadas (batch) e tenta novamente em caso de
// rate limit (HTTP 429), reduzindo a carga sobre o provedor RPC.
const httpOpts = {
  batch: true,
  retryCount: 3,
  retryDelay: 500,
} as const

// Transport resiliente: usa o RPC configurado e, se falhar/limitar (429),
// faz fallback automático para um nó público.
const sepoliaTransport = fallback([
  http(import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com', httpOpts),
  http('https://ethereum-sepolia-rpc.publicnode.com', httpOpts),
  http('https://rpc.sepolia.org', httpOpts),
])

const mainnetTransport = fallback([
  http(import.meta.env.VITE_MAINNET_RPC_URL || 'https://ethereum-rpc.publicnode.com', httpOpts),
  http('https://ethereum-rpc.publicnode.com', httpOpts),
])

export const config = createConfig({
  chains: [sepolia, mainnet],
  // Aumenta o intervalo de polling padrão (4s -> 12s) para diminuir o volume
  // de requisições eth_blockNumber/eth_getLogs e evitar 429.
  pollingInterval: 12_000,
  connectors: [
    injected(),
    // Só registra o WalletConnect se houver um projectId válido,
    // evitando erros "Unauthorized: invalid key" no relayer.
    ...(walletConnectProjectId
      ? [walletConnect({ projectId: walletConnectProjectId })]
      : []),
  ],
  transports: {
    [sepolia.id]: sepoliaTransport,
    [mainnet.id]: mainnetTransport,
  },
})
