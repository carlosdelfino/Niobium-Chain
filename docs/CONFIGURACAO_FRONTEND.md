![visitors](https://visitor-badge.laobi.icu/badge?page_id=eduardo-pinheirop.niobiumchain-web3)
[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC_BY--SA_4.0-blue.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
![Language: Portuguese](https://img.shields.io/badge/Language-Portuguese-brightgreen.svg)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![Jupyter](https://img.shields.io/badge/Jupyter-Notebook-orange)
![Machine Learning](https://img.shields.io/badge/Machine%20Learning-Prática-green)
![Status](https://img.shields.io/badge/Status-Educa%C3%A7%C3%A3o-brightgreen)
![Repository Size](https://img.shields.io/github/repo-size/eduardo-pinheirop/niobiumchain-web3)
![Last Commit](https://img.shields.io/github/last-commit/eduardo-pinheirop/niobiumchain-web3)

<!-- Animated Header -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:1a56db,100:10b981&height=220&section=header&text=RISC-V%20Resilience&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Pesquisa%20em%20Resiliência%20de%20Processadores%20RISC-V&descSize=18&descAlignY=55&descColor=94a3b8" width="100%" alt="RISC-V Resilience Header"/>
</p>

## Configuração do Frontend (Variáveis de Ambiente)

Este documento descreve as variáveis de ambiente usadas pelo frontend (Vite + React + wagmi/viem), com foco na configuração de **RPC** e do **WalletConnect**.

### Regra fundamental do Vite

O Vite só expõe ao código do navegador as variáveis de ambiente que começam com o prefixo **`VITE_`**. Qualquer variável sem esse prefixo (ex.: `SEPOLIA_RPC_URL`) é ignorada no frontend e fica disponível apenas para scripts de backend/Hardhat.

> Por isso o arquivo `frontend/.env` separa as variáveis de **backend** (sem prefixo) das de **frontend** (com `VITE_`).

### Variáveis disponíveis

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `VITE_SEPOLIA_RPC_URL` | Não | URL do nó RPC da rede Sepolia. Se ausente, usa um RPC público sem chave. |
| `VITE_MAINNET_RPC_URL` | Não | URL do nó RPC da Mainnet. Se ausente, usa um RPC público sem chave. |
| `VITE_SUPPLY_CHAIN_ADDRESS` | Sim | Endereço do contrato de cadeia de suprimentos. |
| `VITE_NIOBIUM_DID_ADDRESS` | Sim | Endereço do contrato de identidade (DID). |
| `VITE_BATTERY_TRACKING_ADDRESS` | Sim | Endereço do contrato de rastreio de baterias. |
| `VITE_VEHICLE_TRACKING_ADDRESS` | Sim | Endereço do contrato de rastreio de veículos. |
| `VITE_WALLETCONNECT_PROJECT_ID` | Não | ID de projeto do WalletConnect. Habilita conexão via QR Code / carteiras mobile. |

## RPC URLs

As URLs de RPC definem por qual nó o frontend conversa com a blockchain.

- Se você usar um provedor como **Infura** ou **Alchemy**, a URL precisa conter um **Project ID / API Key** válido. Uma URL sem chave (ex.: `https://sepolia.infura.io/v3/`) retorna **`401 Unauthorized`**.
- Caso `VITE_SEPOLIA_RPC_URL` / `VITE_MAINNET_RPC_URL` não estejam definidas, o app cai para RPCs públicos sem chave configurados em `frontend/src/lib/wagmi.ts`:

```ts
transports: {
  [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'),
  [mainnet.id]: http(import.meta.env.VITE_MAINNET_RPC_URL || 'https://ethereum-rpc.publicnode.com'),
}
```

## O que é `VITE_WALLETCONNECT_PROJECT_ID`

É o **identificador de projeto** exigido pelo **WalletConnect**, o protocolo que permite conectar **carteiras mobile** (Trust Wallet, Rainbow, MetaMask Mobile, etc.) ao dApp via **QR Code**, sem precisar de extensão no navegador.

### Por que existe

Desde a versão 2 do WalletConnect, toda conexão passa por uma infraestrutura de servidores chamada **Relay** (`cloud.reown.com`, antiga `cloud.walletconnect.com`). Para usar esse relay é necessário registrar um projeto e obter uma chave — o `Project ID`.

- Sem um ID válido, o relay recusa a conexão com o erro `Unauthorized: invalid key`.
- Por isso o conector do WalletConnect é registrado de forma **condicional**: só é ativado quando há um ID real.

### É obrigatório?

**Não.** É opcional.

- **Sem ele:** o app funciona normalmente com carteiras de **extensão de navegador** (MetaMask, etc.) via o conector `injected()`.
- **Com ele:** habilita também conexão via **QR Code / carteiras mobile**.

### Implementação (carregamento condicional)

```ts
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

export const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [
    injected(),
    // Só registra o WalletConnect se houver um projectId válido,
    // evitando erros "Unauthorized: invalid key" no relayer.
    ...(walletConnectProjectId
      ? [walletConnect({ projectId: walletConnectProjectId })]
      : []),
  ],
  // ...
})
```

### Como obter o Project ID

1. Acesse `https://cloud.reown.com` e crie uma conta gratuita.
2. Crie um novo projeto (tipo "AppKit"/"WalletConnect").
3. Copie o **Project ID** gerado.
4. Adicione ao `frontend/.env`:

```env
VITE_WALLETCONNECT_PROJECT_ID=cole_aqui_o_id_real
```

5. **Reinicie o servidor Vite** (as variáveis são lidas na inicialização).

> O valor `your_walletconnect_project_id` em `frontend/.env.example` é apenas um **placeholder** ilustrativo — não é uma chave válida.

## Exemplo de `frontend/.env`

```env
# RPC URLs (frontend - Vite só expõe vars com prefixo VITE_)
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/SEU_INFURA_PROJECT_ID
VITE_MAINNET_RPC_URL=https://mainnet.infura.io/v3/SEU_INFURA_PROJECT_ID

# Endereços dos contratos
VITE_SUPPLY_CHAIN_ADDRESS=0x...
VITE_NIOBIUM_DID_ADDRESS=0x...
VITE_BATTERY_TRACKING_ADDRESS=0x...
VITE_VEHICLE_TRACKING_ADDRESS=0x...

# WalletConnect (opcional)
VITE_WALLETCONNECT_PROJECT_ID=seu_project_id_real
```

## Solução de problemas

| Erro no console | Causa provável | Solução |
| --- | --- | --- |
| `401 Unauthorized` em `*.infura.io/v3/` | RPC sem chave ou variável sem prefixo `VITE_` | Use `VITE_SEPOLIA_RPC_URL` com um Project ID válido. |
| `Unauthorized: invalid key` (`core/relayer`) | `VITE_WALLETCONNECT_PROJECT_ID` ausente/inválido | Defina um ID real ou deixe vazio para desabilitar o WalletConnect. |
| `ObjectMultiplex` / `MaxListenersExceededWarning` (`contentscript.js`) | Logs da extensão MetaMask | Inofensivos; não vêm do código do app. |

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10b981,50:1a56db,100:0f172a&height=120&section=footer" width="100%" alt="Footer"/>
</p>

---
**Resumo:** Guia de configuração das variáveis de ambiente do frontend, cobrindo RPC URLs e o `VITE_WALLETCONNECT_PROJECT_ID` do WalletConnect.
**Data de Criação:** 2026-06-03
**Autor:** Rapport GenerAtiva
**Versão:** 1.0
**Última Atualização:** 2026-06-03
**Atualizado por:** Rapport GenerAtiva
**Histórico de Alterações:**
- 2026-06-03 - Criado por Rapport GenerAtiva - Versão 1.0
