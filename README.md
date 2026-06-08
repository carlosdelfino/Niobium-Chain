![visitors](https://visitor-badge.laobi.icu/badge?page_id=eduardo-pinheirop.niobiumchain-web3)
[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC_BY--SA_4.0-blue.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
![Language: Portuguese](https://img.shields.io/badge/Language-Portuguese-brightgreen.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)
![Ethereum](https://img.shields.io/badge/Ethereum-Smart%20Contracts-purple)
![Hardhat](https://img.shields.io/badge/Hardhat-Framework-orange)
![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-Security-green)
![Status](https://img.shields.io/badge/Status-Desenvolvimento-yellow)
![Repository Size](https://img.shields.io/github/repo-size/eduardo-pinheirop/niobiumchain-web3)
![Last Commit](https://img.shields.io/github/last-commit/eduardo-pinheirop/niobiumchain-web3)

<!-- Animated Header -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:1a56db,100:10b981&height=220&section=header&text=NiobiumChain%20Web3&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Supply%20Chain%20Blockchain%20para%20Nióbio&descSize=18&descAlignY=55&descColor=94a3b8" width="100%" alt="NiobiumChain Header"/>
</p>

# NiobiumChain Web3

Sistema completo de Supply Chain blockchain para rastreabilidade de nióbio desde a mineração até o uso em baterias de carros elétricos. Utiliza Ethereum, Solidity, Hardhat, DiD, QR Code e Computer Vision para rastreabilidade multi-etapas dinâmica e flexível.

## 📋 Visão Geral

Este projeto implementa uma solução blockchain completa para rastrear o nióbio através de toda a cadeia de suprimentos, com foco em:

- **Rastreabilidade Multi-Etapas** - Da mineração ao veículo final
- **Identidade Descentralizada (DiD)** - Identificação única de lotes
- **Sistema de QR Code** - Verificação em cada etapa da cadeia
- **Computer Vision Oracle** - Validação visual automatizada
- **Workflow Flexível** - Adaptação a diferentes rotas logísticas
- **Rastreamento de Baterias** - NFTs para cada bateria individual
- **Rastreamento de Veículos** - Registro completo de instalações
- **Passaporte Digital de Baterias** - Conforme EU Battery Regulation 2027
- **Tokenização de Créditos de Carbono** - Gerados pela eficiência do nióbio
- **Compliance com Regulamentações** - Minerais de conflito e sustentabilidade

## 🏗️ Arquitetura

### Contratos Core

- **SupplyChain.sol** - Sistema principal de supply chain com workflow flexível
- **NiobiumDID.sol** - Identidade Descentralizada para lotes de nióbio
- **QRCodeSystem.sol** - Sistema de QR Code para verificação em cada etapa
- **CVOracle.sol** - Oracle para integração com Computer Vision

### Contratos de Etapas

- **MiningStep.sol** - Dados específicos de mineração
- **TransportStep.sol** - Dados de transporte terrestre e marítimo
- **ProcessingStep.sol** - Dados de processamento químico (NTO)
- **PackagingStep.sol** - Dados de embalagem e rotulagem
- **PortStep.sol** - Operações portuárias (carregamento/descarregamento)

### Contratos de Rastreamento

- **BatteryTracking.sol** - NFTs para rastreamento individual de baterias
- **VehicleTracking.sol** - Registro de veículos e instalações de baterias

### Contratos Legados (Compatibilidade)

- **NiobiumToken.sol** - ERC721 para representar lotes de nióbio
- **CarbonCredit.sol** - ERC1155 para créditos de carbono
- **BatteryPassport.sol** - ERC721 para passaportes digitais de baterias

### Características

- ✅ Workflow dinâmico e flexível para diferentes rotas
- ✅ Identidade Descentralizada (DiD) com ECDSA
- ✅ Sistema de QR Code para verificação em cada etapa
- ✅ Computer Vision para validação visual automatizada
- ✅ Controle de acesso baseado em roles granular
- ✅ Mecanismo de pausa para emergências
- ✅ Metadados imutáveis em IPFS
- ✅ Eventos para rastreabilidade completa
- ✅ Otimização de gas
- ✅ Auditoria de segurança integrada

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18+ e npm
- Python 3.8+ (para ferramentas de auditoria)
- Git

### Instalação

```bash
# Clonar repositório
git clone https://github.com/eduardo-pinheirop/niobiumchain-web3.git
cd niobiumchain-web3

# Instalar dependências Node.js
npm install

# Instalar dependências Python (opcional, para auditoria)
pip3 install -r requirements.txt
```

### Configuração

```bash
# Copiar arquivo de exemplo de variáveis de ambiente
cp .env.example .env

# Editar .env com suas credenciais
# - RPC URLs (Infura, Alchemy, etc)
# - Private Key (NUNCA commitar)
# - Etherscan API Key
```

## 🛠️ Desenvolvimento

### Compilar Contratos

```bash
npx hardhat compile
```

### Executar Testes

```bash
# Todos os testes
npx hardhat test

# Testes com cobertura
npx hardhat coverage

# Testes específicos
npx hardhat test test/NiobiumToken.test.js
```

### Deploy Local

```bash
# Iniciar rede local
npx hardhat node

# Em outro terminal, deploy
npx hardhat run scripts/deploy.js --network localhost
```

### Deploy em Testnet

```bash
# Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verificar contrato
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Deploy em Mainnet

```bash
# Mainnet Ethereum
npx hardhat run scripts/deploy.js --network mainnet

# Verificar contrato
npx hardhat verify --network mainnet <CONTRACT_ADDRESS>
```

## 🔍 Auditoria de Segurança

### Slither

```bash
# Análise completa
slither .

# Relatório JSON
slither . --json slither-report.json

# Relatório Markdown
slither . --markdown slither-report.md
```

### MythX

```bash
# Configurar API key
export MYTHX_API_KEY=your_api_key

# Análise
myth analyze contracts/NiobiumToken.sol
```

### Verificação Etherscan

```bash
# Verificar contrato deployado
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 📁 Estrutura do Projeto

```
niobiumchain-web3/
├── contracts/              # Smart contracts Solidity
│   ├── SupplyChain.sol     # Sistema principal de supply chain
│   ├── NiobiumDID.sol      # Identidade Descentralizada
│   ├── QRCodeSystem.sol    # Sistema de QR Code
│   ├── CVOracle.sol        # Oracle para Computer Vision
│   ├── StepContracts.sol   # Contratos de etapas específicas
│   │   ├── MiningStep     # Mineração
│   │   ├── TransportStep  # Transporte
│   │   ├── ProcessingStep # Processamento
│   │   ├── PackagingStep  # Empacotamento
│   │   └── PortStep       # Operações portuárias
│   ├── BatteryVehicleTracking.sol # Rastreamento de baterias e veículos
│   ├── NiobiumToken.sol    # ERC721 para lotes (legado)
│   ├── CarbonCredit.sol    # ERC1155 para créditos (legado)
│   └── BatteryPassport.sol # ERC721 para passaportes (legado)
├── scripts/                # Scripts de deploy e interação
│   ├── deploy.js          # Deploy de todos os contratos
│   ├── deploy-single.js   # Deploy de contrato individual
│   └── interact.js        # Interação com contratos deployados
├── test/                   # Testes unitários
│   ├── SupplyChain.test.js
│   ├── NiobiumDID.test.js
│   ├── QRCodeSystem.test.js
│   ├── CVOracle.test.js
│   ├── BatteryTracking.test.js
│   ├── VehicleTracking.test.js
│   ├── NiobiumToken.test.js
│   ├── CarbonCredit.test.js
│   └── BatteryPassport.test.js
├── docs/                   # Documentação
│   ├── SECURITY_AUDIT.md  # Guia de auditoria de segurança
│   └── ARQUITETURA.md     # Documentação técnica detalhada
├── deployments/            # Endereços de contratos deployados
├── hardhat.config.js      # Configuração Hardhat
├── package.json           # Dependências Node.js
├── requirements.txt       # Dependências Python
├── .env.example           # Exemplo de variáveis de ambiente
└── .slither.json         # Configuração Slither
```

## 🧪 Testes

Os testes cobrem:

- ✅ Deploy e inicialização de todos os contratos
- ✅ Criação de lotes e workflow de supply chain
- ✅ Geração e verificação de DiDs
- ✅ Sistema de QR Code (geração, escaneamento, verificação)
- ✅ Oracle de Computer Vision (submissão, verificação, detecção de anomalias)
- ✅ Etapas específicas (mineração, transporte, processamento, embalagem, porto)
- ✅ Rastreamento de baterias (criação, transferência, instalação em veículos)
- ✅ Rastreamento de veículos (criação, transferência, gerenciamento de baterias)
- ✅ Controle de acesso granular
- ✅ Validações de input
- ✅ Mecanismo de pausa
- ✅ Workflow flexível e dinâmico

## 🔐 Segurança

### Práticas Implementadas

- **OpenZeppelin Contracts** - Bibliotecas auditadas
- **AccessControl** - Controle de acesso granular
- **Pausable** - Mecanismo de emergência
- **ReentrancyGuard** - Proteção contra reentrancy
- **Validations** - Validações rigorosas de input
- **Events** - Eventos para auditoria

### Checklist Antes de Deploy

- [ ] Todos os testes passando
- [ ] Cobertura > 90%
- [ ] Slither sem erros críticos
- [ ] MythX analysis completa
- [ ] Revisão de código manual
- [ ] Verificação em testnet
- [ ] Auditoria externa (opcional)

## 🌐 Remix IDE

Para usar no Remix:

1. Acesse [remix.ethereum.org](https://remix.ethereum.org)
2. Crie um novo workspace
3. Copie os arquivos de `contracts/` para Remix
4. Compile usando Solidity 0.8.20
5. Deploy usando Remix VM ou Injected Provider

## 📚 Documentação

- [Documentação de Segurança](docs/SECURITY_AUDIT.md)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/contracts)
- [Hardhat Docs](https://hardhat.org/docs)
- [Solidity Docs](https://docs.soliditylang.org)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença CC BY-SA 4.0 - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- OpenZeppelin pela biblioteca de contratos seguros
- Hardhat pela framework de desenvolvimento
- Trail of Bits pelo Slither
- ConsenSys pelo MythX

## 📞 Contato

Eduardo Pinheiro - eduardo.pinheirop@gmail.com

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10b981,50:1a56db,100:0f172a&height=120&section=footer" width="100%" alt="Footer"/>
</p>

---
**Resumo:** Projeto blockchain para rastreabilidade de nióbio em baterias e créditos de carbono, usando Ethereum, Solidity, Hardhat e ferramentas de auditoria de segurança.
**Data de Criação:** 2025-05-30
**Autor:** Rapport Generativa
**Versão:** 1.0
**Última Atualização:** 2025-05-30
**Atualizado por:** Rapport Generativa
**Histórico de Alterações:**
- 2025-05-30 - Criado por Rapport Generativa - Versão 1.0
