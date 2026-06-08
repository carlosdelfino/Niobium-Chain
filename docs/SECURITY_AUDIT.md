![visitors](https://visitor-badge.laobi.icu/badge?page_id=eduardo-pinheirop.niobiumchain-web3)
[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC_BY--SA_4.0-blue.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
![Language: Portuguese](https://img.shields.io/badge/Language-Portuguese-brightgreen.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)
![Ethereum](https://img.shields.io/badge/Ethereum-Smart%20Contracts-purple)
![Security](https://img.shields.io/badge/Security-Audit-red)
![Status](https://img.shields.io/badge/Status-Desenvolvimento-yellow)
![Repository Size](https://img.shields.io/github/repo-size/eduardo-pinheirop/niobiumchain-web3)
![Last Commit](https://img.shields.io/github/last-commit/eduardo-pinheirop/niobiumchain-web3)

<!-- Animated Header -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:1a56db,100:10b981&height=220&section=header&text=Auditoria%20de%20Segurança&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Ferramentas%20e%20Procedimentos%20de%20Auditoria&descSize=18&descAlignY=55&descColor=94a3b8" width="100%" alt="Security Audit Header"/>
</p>

## Auditoria de Segurança - NiobiumChain

Este documento descreve as ferramentas e procedimentos de auditoria de segurança utilizados no projeto NiobiumChain.

### Ferramentas de Auditoria

#### 1. Slither

**Slither** é um analisador estático de Solidity desenvolvido pela Trail of Bits.

**Instalação:**
```bash
pip3 install slither-analyzer
```

**Uso:**
```bash
# Análise completa
slither .

# Análise com relatório JSON
slither . --json slither-report.json

# Análise com relatório Markdown
slither . --markdown slither-report.md

# Análise excluindo detectores específicos
slither . --exclude naming-convention,pragma
```

**Detectores Habilitados:**
- Reentrancy
- Unprotected functions
- Unused state variables
- Shadowing
- Gas optimization
- Access control issues

#### 2. MythX

**MythX** é uma plataforma de análise de segurança para smart contracts Ethereum.

**Instalação:**
```bash
pip3 install mythril
```

**Configuração:**
```bash
# Criar conta em https://mythx.io
# Exportar API key
export MYTHX_API_KEY=your_api_key_here
```

**Uso:**
```bash
# Análise de contrato específico
myth analyze contracts/NiobiumToken.sol

# Análise com modo verbose
myth analyze contracts/NiobiumToken.sol -v

# Análise de todos os contratos
myth analyze contracts/
```

#### 3. Etherscan Verification

**Verificação de contratos** no Etherscan para transparência e auditoria pública.

**Uso via Hardhat:**
```bash
# Verificar contrato em Sepolia
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Verificar contrato em Mainnet
npx hardhat verify --network mainnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Checklist de Segurança

Antes do deploy em produção, verificar:

- [ ] Todos os contratos passaram pela análise do Slither sem erros críticos
- [ ] Todos os contratos foram analisados pelo MythX
- [ ] Contratos foram verificados no Etherscan
- [ ] Testes de cobertura atingem >90%
- [ ] Revisão de código manual foi realizada
- [ ] Controles de acesso estão corretamente configurados
- [ ] Pausable mechanism está implementado
- [ ] Eventos estão emitidos para todas as ações críticas
- [ ] Validations de input estão presentes
- [ ] Gas optimization foi realizada

### Vulnerabilidades Comuns

#### Reentrancy
**Proteção:** Usar pattern `checks-effects-interactions` e modifier `nonReentrant` do OpenZeppelin.

#### Access Control
**Proteção:** Usar `AccessControl` do OpenZeppelin com roles bem definidas.

#### Integer Overflow/Underflow
**Proteção:** Solidity 0.8+ tem proteção nativa. Para versões anteriores, usar SafeMath.

#### Front-running
**Proteção:** Usar commit-reveal scheme ou timestamps apropriados.

#### Unchecked Low-level Calls
**Proteção:** Sempre verificar o retorno de calls de baixo nível.

### Relatórios de Auditoria

Todos os relatórios de auditoria devem ser armazenados em `./audit-reports/`:

```
audit-reports/
├── slither-report.json
├── slither-report.md
├── mythx-report.json
└── manual-review.md
```

### Procedimento de Auditoria

1. **Análise Estática (Slither)**
   ```bash
   slither . --json audit-reports/slither-report.json
   ```

2. **Análise Dinâmica (MythX)**
   ```bash
   myth analyze contracts/ --json audit-reports/mythx-report.json
   ```

3. **Testes de Cobertura**
   ```bash
   npx hardhat coverage
   ```

4. **Revisão Manual**
   - Revisar código linha por linha
   - Verificar lógica de negócio
   - Validar controles de acesso

5. **Verificação em Testnet**
   - Deploy em Sepolia
   - Testar todas as funções
   - Verificar no Etherscan

6. **Documentação**
   - Compilar todos os relatórios
   - Documentar issues encontrados
   - Criar plano de mitigação

### Recursos Adicionais

- [OpenZeppelin Security Guidelines](https://docs.openzeppelin.com/contracts/security)
- [Smart Contract Security Verification Checklist](https://consensys.github.io/smart-contract-best-practices/security-recommendations/)
- [SWC Registry](https://swcregistry.io/)
- [Ethereum Smart Contract Security](https://ethereum.org/en/developers/docs/smart-contracts/security/)

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10b981,50:1a56db,100:0f172a&height=120&section=footer" width="100%" alt="Footer"/>
</p>

---
**Resumo:** Documentação completa de ferramentas e procedimentos de auditoria de segurança para smart contracts do projeto NiobiumChain.
**Data de Criação:** 2025-05-30
**Autor:** Rapport Generativa
**Versão:** 1.0
**Última Atualização:** 2025-05-30
**Atualizado por:** Rapport Generativa
**Histórico de Alterações:**
- 2025-05-30 - Criado por Rapport Generativa - Versão 1.0
