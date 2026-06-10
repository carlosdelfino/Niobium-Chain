import { createConfig, fallback, http } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

// Liga logs detalhados de RPC quando VITE_DEBUG_RPC=true. Útil para inspecionar
// requisições/respostas (ex.: descobrir o motivo de um HTTP 400 no eth_getLogs).
const DEBUG_RPC = import.meta.env.VITE_DEBUG_RPC === 'true'

// Callbacks de log: imprimem o método/params enviados e, em respostas não-OK,
// o corpo de erro retornado pelo provedor (onde geralmente vem a causa do 400).
async function onFetchRequest(request: Request) {
  if (!DEBUG_RPC) return
  try {
    const clone = request.clone()
    const body = await clone.text()
    console.debug('[RPC →]', request.url, body)
  } catch {
    /* ignore */
  }
}

async function onFetchResponse(response: Response) {
  if (!DEBUG_RPC && response.ok) return
  try {
    const clone = response.clone()
    const text = await clone.text()
    if (!response.ok) {
      console.error('[RPC ✗]', response.status, response.url, text)
    } else {
      console.debug('[RPC ←]', response.status, response.url, text)
    }
  } catch {
    /* ignore */
  }
}

// Opções compartilhadas: tenta novamente em caso de rate limit (HTTP 429),
// reduzindo a carga sobre o provedor RPC. Batch desabilitado para compatibilidade.
const httpOpts = {
  batch: false,
  retryCount: 3,
  retryDelay: 500,
  onFetchRequest,
  onFetchResponse,
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
// Nota: rpc.ankr.com/eth_sepolia foi removido pois agora exige API key
// (responde 401 Unauthorized sem chave).
const sepoliaTransport = fallback([
  http('https://ethereum-sepolia-rpc.publicnode.com', httpOpts),
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
