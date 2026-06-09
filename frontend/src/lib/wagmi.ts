import { createConfig, fallback, http } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

// Opções compartilhadas: tenta novamente em caso de rate limit (HTTP 429),
// reduzindo a carga sobre o provedor RPC. Batch desabilitado para compatibilidade.
const httpOpts = {
  batch: false,
  retryCount: 3,
  retryDelay: 500,
} as const

// URL de RPC customizada (Infura/Alchemy) opcional via env. Chaves
// públicas/compartilhadas do Infura retornam 401 (Unauthorized) ou 429 (Too
// Many Requests) no navegador, por isso ela é usada apenas como ÚLTIMO recurso.
// Endpoints conhecidos por causar 401/429 (chaves Infura compartilhadas) são
// ignorados explicitamente.
const rawCustomRpc = import.meta.env.VITE_SEPOLIA_RPC_URL
const isUnreliableRpc = !!rawCustomRpc && /infura\.io/i.test(rawCustomRpc)
const customSepoliaRpc = rawCustomRpc && !isUnreliableRpc ? rawCustomRpc : undefined

// Transport resiliente: prioriza nós públicos que suportam CORS e não exigem
// chave de API. A RPC customizada (se houver e for confiável) entra por último.
// Nota: https://rpc.sepolia.org não suporta CORS, então não é usado no navegador.
const sepoliaTransport = fallback([
  http('https://ethereum-sepolia-rpc.publicnode.com', httpOpts),
  http('https://rpc.ankr.com/eth_sepolia', httpOpts),
  http('https://sepolia.drpc.org', httpOpts),
  ...(customSepoliaRpc ? [http(customSepoliaRpc, httpOpts)] : []),
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
