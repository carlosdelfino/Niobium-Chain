![visitors](https://visitor-badge.laobi.icu/badge?page_id=eduardo-pinheirop.niobiumchain-web3)
[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC_BY--SA_4.0-blue.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
![Language: Portuguese](https://img.shields.io/badge/Language-Portuguese-brightgreen.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)
![Hardhat](https://img.shields.io/badge/Hardhat-Framework-orange)
![Automation](https://img.shields.io/badge/Automation-Deploy-green)
![Status](https://img.shields.io/badge/Status-Desenvolvimento-yellow)
![Repository Size](https://img.shields.io/github/repo-size/eduardo-pinheirop/niobiumchain-web3)
![Last Commit](https://img.shields.io/github/last-commit/eduardo-pinheirop/niobiumchain-web3)

<!-- Animated Header -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:1a56db,100:10b981&height=220&section=header&text=Deploy%20Automatizado&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Script%20Automático%20de%20Deploy&descSize=18&descAlignY=55&descColor=94a3b8" width="100%" alt="Auto Deploy Header"/>
</p>

## Deploy Automatizado - Script de Deploy

Script automatizado para deploy de todos os contratos com atualização automática de arquivos de configuração.

## 🚀 Funcionalidades

O script `scripts/deploy-and-update.js` realiza:

1. **Deploy de todos os 12 contratos** em ordem correta
2. **Confirmação interativa** antes do deploy
3. **Salva deployment info** em `deployments/{network}.json`
4. **Atualiza .env** com endereços dos contratos
5. **Atualiza frontend/.env** com endereços relevantes
6. **Atualiza frontend/src/lib/contracts.ts** com endereços
7. **Mostra summary** para configurar secrets do GitHub

## 📋 Contratos Deployados

### Core Contracts (4)
1. SupplyChain
2. NiobiumDID
3. QRCodeSystem
4. CVOracle

### Step Contracts (5)
5. MiningStep (depende de SupplyChain)
6. TransportStep (depende de SupplyChain)
7. ProcessingStep (depende de SupplyChain)
8. PackagingStep (depende de SupplyChain)
9. PortStep (depende de SupplyChain)

### Tracking Contracts (2)
10. BatteryTracking
11. VehicleTracking

### Legacy Contracts (3)
12. NiobiumToken
13. CarbonCredit
14. BatteryPassport

## 🔧 Uso

### Pré-requisitos

- Node.js 18+
- Hardhat configurado
- Variáveis de ambiente no `.env`
- ETH suficiente para gas fees

### Comandos

```bash
# Deploy em localhost
npm run deploy:auto:local

# Deploy em Sepolia (testnet)
npm run deploy:auto:testnet

# Deploy em Mainnet
npm run deploy:auto:mainnet
```

### Execução Direta

```bash
# Localhost
npx hardhat run scripts/deploy-and-update.js --network localhost

# Sepolia
npx hardhat run scripts/deploy-and-update.js --network sepolia

# Mainnet
npx hardhat run scripts/deploy-and-update.js --network mainnet
```

## 📝 Fluxo de Execução

### 1. Preparação

```
📋 Verifica deployer e saldo
💰 Mostra saldo atual
🌐 Mostra rede selecionada
⚠️  Solicita confirmação
```

### 2. Deploy

```
📦 [1/4] Deploy Core Contracts
   → SupplyChain
   → NiobiumDID
   → QRCodeSystem
   → CVOracle

📦 [2/4] Deploy Step Contracts
   → MiningStep
   → TransportStep
   → ProcessingStep
   → PackagingStep
   → PortStep

📦 [3/4] Deploy Tracking Contracts
   → BatteryTracking
   → VehicleTracking

📦 [4/4] Deploy Legacy Contracts
   → NiobiumToken
   → CarbonCredit
   → BatteryPassport
```

### 3. Atualização de Arquivos

```
📝 Atualizando arquivos de configuração
   ✓ .env atualizado
   ✓ frontend/.env atualizado
   ✓ frontend/src/lib/contracts.ts atualizado
```

### 4. Summary

```
📋 Summary for GitHub Secrets
📊 Deploy Summary
📁 Arquivos atualizados
🔗 Próximos passos
```

## 📁 Arquivos Atualizados

### 1. deployments/{network}.json

Salva informações completas do deployment:

```json
{
  "network": "sepolia",
  "deployer": "0x...",
  "timestamp": "2025-05-30T...",
  "contracts": {
    "SupplyChain": "0x...",
    "NiobiumDID": "0x...",
    ...
  },
  "deploymentOrder": [
    { "name": "SupplyChain", "address": "0x..." },
    ...
  ]
}
```

### 2. .env

Atualiza com todos os endereços:

```env
SUPPLY_CHAIN_ADDRESS=0x...
NIOBIUM_DID_ADDRESS=0x...
QR_CODE_SYSTEM_ADDRESS=0x...
CV_ORACLE_ADDRESS=0x...
MINING_STEP_ADDRESS=0x...
TRANSPORT_STEP_ADDRESS=0x...
PROCESSING_STEP_ADDRESS=0x...
PACKAGING_STEP_ADDRESS=0x...
PORT_STEP_ADDRESS=0x...
BATTERY_TRACKING_ADDRESS=0x...
VEHICLE_TRACKING_ADDRESS=0x...
NIOBIUM_TOKEN_ADDRESS=0x...
CARBON_CREDIT_ADDRESS=0x...
BATTERY_PASSPORT_ADDRESS=0x...
```

### 3. frontend/.env

Atualiza com endereços relevantes para o frontend:

```env
VITE_SUPPLY_CHAIN_ADDRESS=0x...
VITE_NIOBIUM_DID_ADDRESS=0x...
VITE_BATTERY_TRACKING_ADDRESS=0x...
VITE_VEHICLE_TRACKING_ADDRESS=0x...
```

### 4. frontend/src/lib/contracts.ts

Atualiza endereços padrão:

```typescript
export const CONTRACT_ADDRESSES = {
  supplyChain: import.meta.env.VITE_SUPPLY_CHAIN_ADDRESS || '0x...',
  niobiumDID: import.meta.env.VITE_NIOBIUM_DID_ADDRESS || '0x...',
  batteryTracking: import.meta.env.VITE_BATTERY_TRACKING_ADDRESS || '0x...',
  vehicleTracking: import.meta.env.VITE_VEHICLE_TRACKING_ADDRESS || '0x...',
} as const;
```

## 🔐 Configuração de Secrets do GitHub

Após o deploy, o script mostra os secrets para configurar no GitHub:

1. Vá ao repositório → **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Adicione cada secret:

```env
VITE_SUPPLY_CHAIN_ADDRESS=0x...
VITE_NIOBIUM_DID_ADDRESS=0x...
VITE_BATTERY_TRACKING_ADDRESS=0x...
VITE_VEHICLE_TRACKING_ADDRESS=0x...
```

## ⚠️ Avisos de Segurança

### Antes do Deploy em Mainnet

1. **Teste extensivamente em testnet**
2. **Audite os contratos** (Slither, Mythril)
3. **Tenha ETH suficiente** para gas fees
4. **Verifique variáveis de ambiente**
5. **Tenha um plano de rollback**

### Durante o Deploy

1. **Monitore o console** para erros
2. **Verifique o saldo** antes de iniciar
3. **Confirme cada transação** no MetaMask
4. **Aguarde confirmação** de cada deploy

### Após o Deploy

1. **Verifique endereços** no Etherscan
2. **Configure secrets** no GitHub
3. **Teste o frontend** com novos endereços
4. **Atualize documentação** se necessário

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

### Erro: "Contract verification failed"

**Problema:** Contrato não verificado no Etherscan.

**Solução:**
```bash
# Verificar manualmente
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> [ARGS]
```

### Erro: "Network timeout"

**Problema:** RPC URL inválido ou lento.

**Solução:**
```bash
# Testar RPC URL
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

### Erro: "Permission denied"

**Problema:** Permissão para escrever arquivos.

**Solução:**
```bash
# Verificar permissões
ls -la .env
ls -la frontend/.env
ls -la frontend/src/lib/contracts.ts

# Corrigir permissões se necessário
chmod 644 .env
chmod 644 frontend/.env
chmod 644 frontend/src/lib/contracts.ts
```

## 📊 Exemplo de Output

```
╔════════════════════════════════════════════════════════════╗
║   NiobiumChain - Deploy Automatizado de Contratos          ║
╚════════════════════════════════════════════════════════════╝

📋 Deployer: 0x1234...
💰 Saldo: 1.5 ETH
🌐 Rede: sepolia

⚠️  Deseja continuar com o deploy? (y/n): y

🚀 Iniciando deploy dos contratos...

📦 [1/4] Deploying Core Contracts...
   → SupplyChain...
   ✓ SupplyChain: 0xabcd...
   → NiobiumDID...
   ✓ NiobiumDID: 0xefgh...
   → QRCodeSystem...
   ✓ QRCodeSystem: 0xijkl...
   → CVOracle...
   ✓ CVOracle: 0xmnop...

📦 [2/4] Deploying Step Contracts...
   → MiningStep...
   ✓ MiningStep: 0xqrst...
   ...

✅ Todos os contratos deployados com sucesso!

📁 Deployment info salvo em: deployments/sepolia.json

📝 Atualizando arquivos de configuração...
   ✓ .env atualizado
   ✓ frontend/.env atualizado
   ✓ frontend/src/lib/contracts.ts atualizado

📋 Summary for GitHub Secrets:
   VITE_SUPPLY_CHAIN_ADDRESS=0xabcd...
   VITE_NIOBIUM_DID_ADDRESS=0xefgh...
   ...

╔════════════════════════════════════════════════════════════╗
║   ✅ Deploy concluído com sucesso!                         ║
╚════════════════════════════════════════════════════════════╝
```

## 🔗 Próximos Passos

### Após o Deploy

1. **Verificar contratos no Etherscan**
   - Acesse cada endereço
   - Verifique se o bytecode está correto
   - Verifique se as funções estão disponíveis

2. **Configurar secrets no GitHub**
   - Adicione os secrets mostrados
   - Atualize se necessário

3. **Testar integração**
   - Inicie o frontend: `cd frontend && npm run dev`
   - Conecte MetaMask
   - Teste funcionalidades

4. **Atualizar documentação**
   - Atualize README com novos endereços
   - Atualize guias de deploy

### Verificação

```bash
# Verificar deployment
cat deployments/sepolia.json

# Verificar .env
cat .env

# Verificar frontend
cat frontend/.env
cat frontend/src/lib/contracts.ts
```

## 📚 Recursos

- [Hardhat Documentation](https://hardhat.org/docs)
- [Etherscan API](https://docs.etherscan.io/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10b981,50:1a56db,100:0f172a&height=120&section=footer" width="100%" alt="Footer"/>
</p>

---
**Resumo:** Guia completo do script automatizado de deploy com atualização automática de arquivos de configuração.
**Data de Criação:** 2025-05-30
**Autor:** Rapport Generativa
**Versão:** 1.0
**Última Atualização:** 2025-05-30
**Atualizado por:** Rapport Generativa
**Histórico de Alterações:**
- 2025-05-30 - Criado por Rapport Generativa - Versão 1.0
