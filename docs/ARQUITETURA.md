![visitors](https://visitor-badge.laobi.icu/badge?page_id=eduardo-pinheirop.niobiumchain-web3)
[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC_BY--SA_4.0-blue.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
![Language: Portuguese](https://img.shields.io/badge/Language-Portuguese-brightgreen.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)
![Ethereum](https://img.shields.io/badge/Ethereum-Smart%20Contracts-purple)
![Architecture](https://img.shields.io/badge/Architecture-Technical-orange)
![Status](https://img.shields.io/badge/Status-Desenvolvimento-yellow)
![Repository Size](https://img.shields.io/github/repo-size/eduardo-pinheirop/niobiumchain-web3)
![Last Commit](https://img.shields.io/github/last-commit/eduardo-pinheirop/niobiumchain-web3)

<!-- Animated Header -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:1a56db,100:10b981&height=220&section=header&text=Arquitetura%20Técnica&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Documentação%20de%20Arquitetura%20do%20Sistema&descSize=18&descAlignY=55&descColor=94a3b8" width="100%" alt="Architecture Header"/>
</p>

## Arquitetura Técnica - NiobiumChain

Este documento descreve a arquitetura técnica detalhada do sistema NiobiumChain, incluindo smart contracts, padrões de design e fluxos de dados.

## 🏗️ Visão Geral da Arquitetura

O sistema NiobiumChain é composto por três smart contracts principais que operam em conjunto para fornecer rastreabilidade completa da cadeia de suprimentos de nióbio:

```
┌─────────────────┐
│  NiobiumToken   │ (ERC721)
│  Lotes de Nióbio│
└────────┬────────┘
         │
         │ Referência
         │
┌────────▼────────┐
│  CarbonCredit   │ (ERC1155)
│  Créditos CO2   │
└────────┬────────┘
         │
         │ Componentes
         │
┌────────▼────────┐
│ BatteryPassport │ (ERC721)
│ Passaportes     │
└─────────────────┘
```

## 📦 Smart Contracts

### 1. NiobiumToken (ERC721)

**Propósito:** Representar lotes físicos de nióbio na blockchain.

**Características:**
- Cada token NFT representa um lote único de nióbio
- Metadados imutáveis armazenados off-chain (IPFS)
- Rastreabilidade completa do produtor ao consumidor final
- Certificação de minerais de conflito

**Estrutura de Dados:**

```solidity
struct NiobiumBatch {
    string batchId;              // ID único do lote físico
    address producer;            // Endereço do produtor
    uint256 weight;              // Peso em kg
    string purity;               // Pureza do material
    string origin;               // Origem geológica
    uint256 timestamp;           // Timestamp de criação
    bool isConflictFree;         // Certificação de conflito
    string miningLicense;        // Licença de mineração
}
```

**Funções Principais:**

- `mintBatch()` - Cria novo token representando lote de nióbio
- `updateProducer()` - Atualiza informações do produtor
- `pause()/unpause()` - Controle de emergência

**Eventos:**

- `BatchMinted` - Emitido quando novo lote é criado
- `BatchTransferred` - Emitido quando lote é transferido

### 2. CarbonCredit (ERC1155)

**Propósito:** Tokenizar créditos de carbono gerados pela eficiência do nióbio.

**Características:**
- Múltiplos tipos de créditos em um único contrato
- Verificação por auditores autorizados
- Aposentadoria (burn) de créditos após uso
- Cálculo baseado em metodologias ISO 14064

**Estrutura de Dados:**

```solidity
struct CarbonCreditData {
    uint256 niobiumBatchId;      // ID do lote de nióbio relacionado
    uint256 co2Avoided;          // Toneladas de CO2 evitadas
    string methodology;          // Metodologia de cálculo
    uint256 timestamp;           // Timestamp de criação
    bool verified;               // Status de verificação
    address verifier;            // Endereço do verificador
}
```

**Funções Principais:**

- `mintCredit()` - Cria novos créditos de carbono
- `verifyCredit()` - Verifica créditos (apenas auditores)
- `retireCredit()` - Aposenta créditos após uso

**Eventos:**

- `CreditMinted` - Emitido quando crédito é criado
- `CreditVerified` - Emitido quando crédito é verificado
- `CreditRetired` - Emitido quando crédito é aposentado

### 3. BatteryPassport (ERC721)

**Propósito:** Criar passaportes digitais para baterias (EU Battery Regulation).

**Características:**
- Cada bateria tem passaporte único
- Rastreabilidade de todos os componentes
- Pegada de carbono calculada
- Conteúdo reciclado documentado
- Invalidação em caso de recall

**Estrutura de Dados:**

```solidity
struct BatteryComponent {
    string componentType;        // Tipo (anodo, catodo, etc)
    uint256 niobiumBatchId;      // ID do lote de nióbio
    string supplier;             // Fornecedor
    uint256 weight;              // Peso em kg
    string origin;               // Origem do material
}

struct BatteryData {
    string serialNumber;         // Número de série único
    address manufacturer;        // Fabricante
    string model;                // Modelo da bateria
    uint256 capacity;            // Capacidade em kWh
    uint256 manufacturingDate;   // Data de fabricação
    BatteryComponent[] components; // Lista de componentes
    uint256 carbonFootprint;     // Pegada de carbono
    uint256 recycledContent;     // Conteúdo reciclado %
    bool isValid;                // Status de validade
}
```

**Funções Principais:**

- `createPassport()` - Cria novo passaporte de bateria
- `addComponent()` - Adiciona componente ao passaporte
- `invalidatePassport()` - Invalida passaporte (recall)

**Eventos:**

- `PassportCreated` - Emitido quando passaporte é criado
- `ComponentAdded` - Emitido quando componente é adicionado
- `PassportInvalidated` - Emitido quando passaporte é invalidado

## 🔐 Controle de Acesso

O sistema usa o padrão **AccessControl** do OpenZeppelin com roles hierárquicas:

### Roles Definidas

1. **DEFAULT_ADMIN_ROLE** - Controle total do sistema
2. **ADMIN_ROLE** - Administração operacional
3. **MINTER_ROLE** - Permissão para criar tokens
4. **AUDITOR_ROLE** - Permissão para verificar créditos
5. **MANUFACTURER_ROLE** - Permissão para criar passaportes

### Hierarquia de Permissões

```
DEFAULT_ADMIN_ROLE
├── ADMIN_ROLE
│   ├── MINTER_ROLE
│   ├── AUDITOR_ROLE
│   └── MANUFACTURER_ROLE
└── Todos os roles podem ser gerenciados pelo admin
```

## 🔄 Fluxos de Dados

### Fluxo 1: Criação de Lote de Nióbio

```
1. Produtor solicita criação de lote
2. Admin (MINTER_ROLE) valida documentação
3. mintBatch() é chamado
4. Token ERC721 é criado
5. Metadados são armazenados em IPFS
6. Evento BatchMinted é emitido
7. Lote está rastreável na blockchain
```

### Fluxo 2: Criação de Crédito de Carbono

```
1. Cálculo de CO2 evitada é realizado
2. Metodologia ISO 14064 é aplicada
3. mintCredit() é chamado
4. Token ERC1155 é criado
5. Crédito fica pendente de verificação
6. Auditor (AUDITOR_ROLE) verifica
7. verifyCredit() é chamado
8. Crédito torna-se verificável
```

### Fluxo 3: Criação de Passaporte de Bateria

```
1. Fabricante cria passaporte
2. createPassport() é chamado
3. Token ERC721 é criado
4. Componentes são adicionados
5. addComponent() é chamado para cada componente
6. Referência ao lote de nióbio é estabelecida
7. Passaporte está pronto para compliance
```

## 🛡️ Padrões de Segurança

### 1. Checks-Effects-Interactions

Todos os contratos seguem o padrão checks-effects-interactions para prevenir reentrancy:

```solidity
function example() external {
    // 1. Checks
    require(condition, "Error message");
    
    // 2. Effects
    stateVariable = newValue;
    
    // 3. Interactions
    externalContract.call();
}
```

### 2. AccessControl

Controle de acesso granular usando roles do OpenZeppelin:

```solidity
function sensitiveFunction() external onlyRole(ADMIN_ROLE) {
    // Apenas admins podem executar
}
```

### 3. Pausable

Mecanismo de emergência para pausar operações:

```solidity
function criticalFunction() external whenNotPaused {
    // Função pausável
}
```

### 4. ReentrancyGuard

Proteção contra ataques de reentrancy (via OpenZeppelin).

### 5. Input Validation

Validação rigorosa de todos os inputs:

```solidity
require(weight > 0, "Weight must be greater than 0");
require(recycledContent <= 100, "Recycled content must be <= 100%");
```

## 📊 Metadados e IPFS

### Estrutura de Metadados

Os metadados são armazenados em IPFS seguindo o padrão ERC721/ERC1155:

```json
{
  "name": "Niobium Batch #001",
  "description": "Lote de nióbio de alta pureza",
  "image": "ipfs://QmHash...",
  "attributes": [
    {
      "trait_type": "Weight",
      "value": "1000 kg"
    },
    {
      "trait_type": "Purity",
      "value": "99.9%"
    },
    {
      "trait_type": "Origin",
      "value": "Brazil"
    },
    {
      "trait_type": "Conflict Free",
      "value": true
    }
  ]
}
```

### Integração IPFS

- Metadados são uploadados para IPFS
- Hash IPFS é armazenado no contrato
- URI do token aponta para o hash IPFS
- Dados são imutáveis e descentralizados

## ⛽ Otimização de Gas

### Estratégias Implementadas

1. **Packing de Structs** - Variáveis são ordenadas para minimizar storage slots
2. **Eventos em vez de Storage** - Dados temporários são emitidos como eventos
3. **Mappings em vez de Arrays** - O(1) lookup em vez de O(n)
4. **Short Strings** - Strings curtas quando possível
5. **Custom Errors** - Erros customizados economizam gas

### Exemplo de Packing

```solidity
struct Optimized {
    uint128 weight;      // 16 bytes
    uint64 timestamp;    // 8 bytes
    bool isConflictFree; // 1 byte
    // Total: 25 bytes (cabe em 1 slot de 32 bytes)
}
```

## 🧪 Testes

### Estrutura de Testes

Os testes são organizados por contrato e funcionalidade:

```
test/
├── NiobiumToken.test.js
│   ├── Deployment
│   ├── Minting
│   ├── Batch Information
│   ├── Pausable
│   └── Token Transfer
├── CarbonCredit.test.js
│   ├── Deployment
│   ├── Minting Credits
│   ├── Credit Verification
│   ├── Credit Retirement
│   ├── Pausable
│   └── Batch Operations
└── BatteryPassport.test.js
    ├── Deployment
    ├── Passport Creation
    ├── Component Management
    ├── Passport Invalidation
    ├── Pausable
    └── Battery Information
```

### Cobertura

Meta de cobertura: >90%

```bash
npx hardhat coverage
```

## 🚀 Deploy

### Estratégia de Deploy

1. **Local** - Desenvolvimento e testes
2. **Sepolia** - Testnet pública
3. **Mainnet** - Produção

### Processo de Deploy

```bash
# 1. Compilar
npx hardhat compile

# 2. Testar
npx hardhat test

# 3. Auditoria
slither .

# 4. Deploy
npx hardhat run scripts/deploy.js --network <network>

# 5. Verificar
npx hardhat verify --network <network> <address>
```

### Verificação

Todos os contratos são verificados no Etherscan para transparência.

## 🔍 Auditoria

### Ferramentas Utilizadas

1. **Slither** - Análise estática
2. **MythX** - Análise dinâmica
3. **Etherscan** - Verificação pública
4. **Testes Manuais** - Revisão de código

### Checklist de Auditoria

- [ ] Slither sem erros críticos
- [ ] MythX analysis completa
- [ ] Cobertura de testes >90%
- [ ] Revisão de código manual
- [ ] Verificação em testnet
- [ ] Auditoria externa (opcional)

## 📈 Escalabilidade

### Considerações

- **Gas Limits** - Funções otimizadas para minimizar gas
- **Storage** - Dados pesados em IPFS, apenas hashes na blockchain
- **Batch Operations** - Operações em lote quando possível
- **Layer 2** - Futura migração para L2 se necessário

## 🔄 Upgradeabilidade

### Estratégia Atual

Contratos não são upgradeáveis por design para simplicidade e segurança.

### Futuras Melhorias

- Considerar padrão proxy para upgrades
- Implementar timelock para mudanças críticas
- Governança DAO para decisões de upgrade

## 📚 Referências

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [ERC721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [ERC1155 Standard](https://eips.ethereum.org/EIPS/eip-1155)
- [EU Battery Regulation](https://ec.europa.eu/environment/topics/waste-and-recycling/batteries_en)
- [ISO 14064](https://www.iso.org/standard/38498.html)

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10b981,50:1a56db,100:0f172a&height=120&section=footer" width="100%" alt="Footer"/>
</p>

---
**Resumo:** Documentação técnica completa da arquitetura do sistema NiobiumChain, incluindo smart contracts, padrões de segurança, fluxos de dados e estratégias de deploy.
**Data de Criação:** 2025-05-30
**Autor:** Rapport Generativa
**Versão:** 1.0
**Última Atualização:** 2025-05-30
**Atualizado por:** Rapport Generativa
**Histórico de Alterações:**
- 2025-05-30 - Criado por Rapport Generativa - Versão 1.0
