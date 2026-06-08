![visitors](https://visitor-badge.laobi.icu/badge?page_id=eduardo-pinheirop.niobiumchain-web3)
[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC_BY--SA_4.0-blue.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
![Language: Portuguese](https://img.shields.io/badge/Language-Portuguese-brightgreen.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)
![Ethereum](https://img.shields.io/badge/Ethereum-Smart%20Contracts-purple)
![Hardhat](https://img.shields.io/badge/Hardhat-Framework-orange)
![Status](https://img.shields.io/badge/Status-Desenvolvimento-yellow)
![Repository Size](https://img.shields.io/github/repo-size/eduardo-pinheirop/niobiumchain-web3)
![Last Commit](https://img.shields.io/github/last-commit/eduardo-pinheirop/niobiumchain-web3)

<!-- Animated Header -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:1a56db,100:10b981&height=220&section=header&text=Guia%20de%20Deploy&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Deploy%20de%20Smart%20Contracts%20NiobiumChain&descSize=18&descAlignY=55&descColor=94a3b8" width="100%" alt="Deployment Guide Header"/>
</p>

## Guia de Deploy - NiobiumChain

Este documento fornece instruções detalhadas para fazer o deploy dos smart contracts do NiobiumChain em redes Ethereum (testnet e mainnet).

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Configuração de Ambiente](#configuração-de-ambiente)
- [Deploy em Localhost](#deploy-em-localhost)
- [Deploy em Testnet (Sepolia)](#deploy-em-testnet-sepolia)
- [Deploy em Mainnet](#deploy-em-mainnet)
- [Verificação de Contratos](#verificação-de-contratos)
- [Gerenciamento de Deployments](#gerenciamento-de-deployments)
- [Atualização de Contratos](#atualização-de-contratos)
- [Troubleshooting](#troubleshooting)

## 🚀 Pré-requisitos

### Software Necessário

- **Node.js** 18+ e npm
- **Python** 3.8+ (para ferramentas de auditoria)
- **Git**

### Contas e Serviços

- **Carteira Ethereum** (MetaMask ou similar)
- **ETH** para gas fees
- **RPC Provider** (Infura, Alchemy, ou similar)
- **Etherscan API Key** (para verificação de contratos)

### Conhecimentos Necessários

- Básico de linha de comando
- Conceitos básicos de Ethereum e smart contracts
- Uso de MetaMask

## ⚙️ Configuração de Ambiente

### 1. Clonar o Repositório

```bash
git clone https://github.com/eduardo-pinheirop/niobiumchain-web3.git
cd niobiumchain-web3
```

### 2. Instalar Dependências

```bash
# Instalar dependências Node.js
npm install

# Instalar dependências Python (opcional, para auditoria)
pip3 install -r requirements.txt
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais
nano .env
```

### 4. Variáveis de Ambiente Necessárias

```env
# RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Private Key (NUNCA commitar)
PRIVATE_KEY=your_private_key_here

# Etherscan API Key (para verificação)
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# WalletConnect Project ID (opcional, para frontend)
WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 5. Obter Credenciais

#### Infura RPC URL

1. Acesse [Infura](https://infura.io/)
2. Crie uma conta
3. Crie um novo projeto
4. Copie o RPC URL para Sepolia e Mainnet

#### Etherscan API Key

1. Acesse [Etherscan](https://etherscan.io/)
2. Crie uma conta
3. Vá em API Keys
4. Copie sua API Key

#### Private Key

1. Abra MetaMask
2. Clique em "Account Details"
3. Clique em "Export Private Key"
4. Insira sua senha
5. **IMPORTANTE:** Nunca compartilhe sua private key!

## 🏠 Deploy em Localhost

### 1. Iniciar Rede Local

```bash
# Iniciar Hardhat Network
npx hardhat node
```

Isso iniciará uma rede local em `http://localhost:8545`.

### 2. Deploy em Outro Terminal

```bash
# Deploy na rede local
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Verificar Deploy

O script irá:
- Deploy de todos os 12 contratos
- Salvar endereços em `deployments/localhost.json`
- Exibir resumo do deployment

### 4. Interagir com Contratos

```bash
# Interagir com contratos deployados
npx hardhat run scripts/interact.js --network localhost
```

## 🧪 Deploy em Testnet (Sepolia)

### 1. Obter ETH de Teste

Visite um faucet para obter ETH de teste:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)

### 2. Compilar Contratos

```bash
npx hardhat compile
```

### 3. Deploy em Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Verificar Saldo

```bash
# Verificar saldo da conta
npx hardhat run scripts/check-balance.js --network sepolia
```

### 5. Verificar Endereços

Os endereços serão salvos em `deployments/sepolia.json`:

```json
{
  "network": "sepolia",
  "deployer": "0x...",
  "timestamp": "2025-05-30T...",
  "contracts": {
    "SupplyChain": "0x...",
    "NiobiumDID": "0x...",
    "QRCodeSystem": "0x...",
    "CVOracle": "0x...",
    "MiningStep": "0x...",
    "TransportStep": "0x...",
    "ProcessingStep": "0x...",
    "PackagingStep": "0x...",
    "PortStep": "0x...",
    "BatteryTracking": "0x...",
    "VehicleTracking": "0x...",
    "NiobiumToken": "0x...",
    "CarbonCredit": "0x...",
    "BatteryPassport": "0x..."
  }
}
```

### 6. Verificar no Etherscan

```bash
# Verificar contrato SupplyChain
npx hardhat verify --network sepolia <SUPPLY_CHAIN_ADDRESS>

# Verificar contrato NiobiumDID
npx hardhat verify --network sepolia <NIOBIUM_DID_ADDRESS>

# Verificar contrato QRCodeSystem
npx hardhat verify --network sepolia <QR_CODE_SYSTEM_ADDRESS>

# Verificar contrato CVOracle
npx hardhat verify --network sepolia <CV_ORACLE_ADDRESS>

# Verificar contratos de etapas (com argumento SupplyChain)
npx hardhat verify --network sepolia <MINING_STEP_ADDRESS> <SUPPLY_CHAIN_ADDRESS>
npx hardhat verify --network sepolia <TRANSPORT_STEP_ADDRESS> <SUPPLY_CHAIN_ADDRESS>
npx hardhat verify --network sepolia <PROCESSING_STEP_ADDRESS> <SUPPLY_CHAIN_ADDRESS>
npx hardhat verify --network sepolia <PACKAGING_STEP_ADDRESS> <SUPPLY_CHAIN_ADDRESS>
npx hardhat verify --network sepolia <PORT_STEP_ADDRESS> <SUPPLY_CHAIN_ADDRESS>

# Verificar contratos de rastreamento
npx hardhat verify --network sepolia <BATTERY_TRACKING_ADDRESS>
npx hardhat verify --network sepolia <VEHICLE_TRACKING_ADDRESS>

# Verificar contratos legados
npx hardhat verify --network sepolia <NIOBIUM_TOKEN_ADDRESS>
npx hardhat verify --network sepolia <CARBON_CREDIT_ADDRESS>
npx hardhat verify --network sepolia <BATTERY_PASSPORT_ADDRESS>
```

## 🌐 Deploy em Mainnet

### ⚠️ AVISO IMPORTANTE

**Antes de fazer deploy em mainnet:**

1. **Teste exaustivamente em testnet**
2. **Audite os contratos** (use Slither, Mythril, etc)
3. **Tenha ETH suficiente** para gas fees
4. **Tenha um plano de emergência**
5. **Revise todos os parâmetros**

### 1. Estimar Gas Fees

```bash
# Estimar custo de deploy
npx hardhat run scripts/estimate-gas.js --network mainnet
```

### 2. Deploy em Mainnet

```bash
npx hardhat run scripts/deploy.js --network mainnet
```

### 3. Verificar Deploy

```bash
# Verificar todos os contratos
npx hardhat verify --network mainnet <CONTRACT_ADDRESS> [CONSTRUCTOR_ARGS]
```

### 4. Atualizar Frontend

Atualize os endereços no frontend:

```env
# frontend/.env
VITE_SUPPLY_CHAIN_ADDRESS=0x...
VITE_NIOBIUM_DID_ADDRESS=0x...
VITE_BATTERY_TRACKING_ADDRESS=0x...
VITE_VEHICLE_TRACKING_ADDRESS=0x...
```

## 🔍 Verificação de Contratos

### Verificação Automática

Adicione ao `hardhat.config.js`:

```javascript
etherscan: {
  apiKey: process.env.ETHERSCAN_API_KEY,
},
```

### Verificação Manual

```bash
# Verificar contrato sem argumentos
npx hardhat verify --network <NETWORK> <CONTRACT_ADDRESS>

# Verificar contrato com argumentos
npx hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <ARG1> <ARG2>
```

### Verificação em Batch

Crie um script `scripts/verify-all.js`:

```javascript
const hre = require("hardhat");
const deployment = require("../deployments/sepolia.json");

async function main() {
  const network = hre.network.name;
  
  for (const [name, address] of Object.entries(deployment.contracts)) {
    try {
      console.log(`Verifying ${name}...`);
      await hre.run("verify:verify", {
        address,
        network,
      });
      console.log(`✓ ${name} verified`);
    } catch (error) {
      console.error(`✗ ${name} failed:`, error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

Execute:

```bash
npx hardhat run scripts/verify-all.js --network sepolia
```

## 📁 Gerenciamento de Deployments

### Estrutura de Diretórios

```
deployments/
├── localhost.json
├── sepolia.json
└── mainnet.json
```

### Formato do Arquivo de Deployment

```json
{
  "network": "sepolia",
  "deployer": "0x1234...",
  "timestamp": "2025-05-30T20:00:00.000Z",
  "contracts": {
    "SupplyChain": "0xabcd...",
    "NiobiumDID": "0xefgh...",
    ...
  }
}
```

### Script de Deploy Individual

Use `scripts/deploy-single.js` para deploy de contratos individuais:

```bash
# Deploy apenas SupplyChain
npx hardhat run scripts/deploy-single.js --network sepolia SupplyChain

# Deploy apenas NiobiumDID
npx hardhat run scripts/deploy-single.js --network sepolia NiobiumDID
```

## 🔄 Atualização de Contratos

### Padrão de Proxy

Para contratos que precisam ser atualizáveis, use o padrão UUPS:

```solidity
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract MyContract is UUPSUpgradeable {
    function _authorizeUpgrade(address) internal override {}
}
```

### Deploy de Proxy

```bash
# Deploy implementation
npx hardhat run scripts/deploy-implementation.js --network sepolia

# Deploy proxy
npx hardhat run scripts/deploy-proxy.js --network sepolia
```

### Atualização de Proxy

```bash
# Deploy nova implementação
npx hardhat run scripts/deploy-implementation.js --network sepolia

# Atualizar proxy
npx hardhat run scripts/upgrade-proxy.js --network sepolia
```

## 🛠️ Troubleshooting

### Erro: "Insufficient funds"

**Problema:** Saldo insuficiente para gas fees.

**Solução:**
```bash
# Verificar saldo
npx hardhat run scripts/check-balance.js --network sepolia

# Obter mais ETH de teste
# Visite: https://sepoliafaucet.com/
```

### Erro: "Nonce too high"

**Problema:** Nonce da carteira está incorreto.

**Solução:**
```bash
# Resetar nonce no MetaMask
# Settings > Advanced > Reset Account
```

### Erro: "Contract verification failed"

**Problema:** Argumentos do construtor incorretos.

**Solução:**
```bash
# Verificar bytecode
npx hardhat run scripts/check-bytecode.js --network sepolia

# Comparar com Etherscan
```

### Erro: "Network timeout"

**Problema:** RPC URL inválido ou lento.

**Solução:**
```bash
# Testar RPC URL
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Usar RPC alternativo (Alchemy, QuickNode)
```

### Erro: "Gas estimation failed"

**Problema:** Contrato usa muito gas.

**Solução:**
```bash
# Aumentar gas limit no hardhat.config.js
networks: {
  sepolia: {
    gas: 12000000,
    gasPrice: 20000000000,
  }
}
```

### Erro: "Private key is invalid"

**Problema:** Private key incorreta ou com prefixo 0x.

**Solução:**
```bash
# Remover prefixo 0x se necessário
PRIVATE_KEY=abcdef123456... (sem 0x)

# Ou adicionar prefixo 0x
PRIVATE_KEY=0xabcdef123456...
```

## 📊 Monitoramento

### Monitorar Transações

```bash
# Script para monitorar transações
npx hardhat run scripts/monitor-tx.js --network sepolia
```

### Eventos

```bash
# Escutar eventos
npx hardhat run scripts/listen-events.js --network sepolia
```

### Logs

```bash
# Verificar logs do Hardhat
npx hardhat node --verbose
```

## 🔐 Segurança

### Best Practices

1. **Nunca commitar** `.env` ou private keys
2. **Use diferentes contas** para deploy e operações
3. **Habilite 2FA** em todas as contas
4. **Use hardware wallets** para mainnet
5. **Audite contratos** antes do deploy
6. **Teste extensivamente** em testnet
7. **Tenha um plano de rollback**

### Checklist Pre-Deploy

- [ ] Contratos compilados sem erros
- [ ] Testes passando
- [ ] Auditoria de segurança realizada
- [ ] Gas fees estimados
- [ ] Saldo suficiente
- [ ] RPC URL configurado
- [ ] Private key segura
- [ ] Endereços verificados
- [ ] Frontend atualizado
- [ ] Documentação atualizada

## 📚 Recursos Adicionais

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Etherscan API](https://docs.etherscan.io/)
- [Infura Documentation](https://docs.infura.io/)
- [MetaMask Documentation](https://docs.metamask.io/)

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10b981,50:1a56db,100:0f172a&height=120&section=footer" width="100%" alt="Footer"/>
</p>

---
**Resumo:** Guia completo para deploy dos smart contracts NiobiumChain em redes Ethereum, incluindo configuração, deploy em testnet/mainnet, verificação e troubleshooting.
**Data de Criação:** 2025-05-30
**Autor:** Rapport Generativa
**Versão:** 1.0
**Última Atualização:** 2025-05-30
**Atualizado por:** Rapport Generativa
**Histórico de Alterações:**
- 2025-05-30 - Criado por Rapport Generativa - Versão 1.0
