![visitors](https://visitor-badge.laobi.icu/badge?page_id=eduardo-pinheirop.niobiumchain-web3)
[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC_BY--SA_4.0-blue.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
![Language: Portuguese](https://img.shields.io/badge/Language-Portuguese-brightgreen.svg)
![UML](https://img.shields.io/badge/UML-Diagrams-orange)
![Draw.io](https://img.shields.io/badge/Draw.io-XML-blue)
![Status](https://img.shields.io/badge/Status-Desenvolvimento-yellow)
![Repository Size](https://img.shields.io/github/repo-size/eduardo-pinheirop/niobiumchain-web3)
![Last Commit](https://img.shields.io/github/last-commit/eduardo-pinheirop/niobiumchain-web3)

<!-- Animated Header -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:1a56db,100:10b981&height=220&section=header&text=Diagramas%20UML&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Documentação%20Visual%20do%20Sistema%20NiobiumChain&descSize=18&descAlignY=55&descColor=94a3b8" width="100%" alt="UML Diagrams Header"/>
</p>

## Diagramas UML - NiobiumChain

Este diretório contém os diagramas UML do sistema NiobiumChain, criados com draw.io para visualização da arquitetura e fluxos do sistema.

## 📊 Diagramas Disponíveis

### 1. Caso de Uso - NiobiumChain

**Arquivo:** `caso_de_uso_niobiumchain.drawio`

**Descrição:** Diagrama de caso de uso completo do sistema, mostrando todos os atores e casos de uso implementados e propostos.

**Atores Identificados:**
- Produtor de Nióbio
- Transportador
- Processador Químico
- Fabricante de Baterias
- Montador de Veículos
- Auditor
- Administrador
- Usuário Final

**Casos de Uso Implementados (Verde):**
- Criar Lote de Nióbio
- Registrar Mineração
- Registrar Transporte
- Registrar Processamento
- Registrar Embalagem
- Gerar QR Code
- Escanear QR Code
- Criar DID
- Consultar Histórico
- Criar Crédito de Carbono
- Verificar Crédito
- Aposentar Crédito
- Criar Passaporte de Bateria
- Adicionar Componente
- Criar Bateria
- Criar Veículo
- Instalar Bateria
- Transferir Veículo

**Casos de Uso Propostos (Amarelo):**
- Validação CV Oracle
- Detectar Anomalias
- Registrar Operação Portuária
- Registrar Embarque Marítimo
- Invalidar Passaporte
- Recall de Bateria
- Auditoria de Compliance
- Governança DAO
- Migração Layer 2
- Upgrade via Proxy
- Timelock para Mudanças

### 2. Sequência - Supply Chain

**Arquivo:** `sequencia_supply_chain.drawio`

**Descrição:** Diagrama de sequência mostrando o fluxo completo do workflow de supply chain, desde a criação do lote até a fabricação de baterias.

**Objetos/Componentes:**
- Produtor (Ator)
- SupplyChain (Orquestrador principal)
- MiningStep (Etapa de mineração)
- NiobiumDID (Sistema de identidade)
- QRCodeSystem (Geração e verificação de QR Codes)
- CV Oracle (Validação visual)
- TransportStep (Etapa de transporte)
- ProcessingStep (Etapa de processamento)
- BatteryTracking (Rastreamento de baterias)

**Fluxo Principal:**
1. Criação de lote com DID
2. Registro de mineração com validação CV
3. Geração e escaneamento de QR Codes
4. Transporte com checkpoints
5. Processamento químico
6. Fabricação de baterias
7. Consulta de histórico completo

**Integrações Destacadas:**
- DID para identidade única e imutável
- QR Code para verificação física em cada etapa
- CV Oracle para validação visual automatizada
- Blockchain para garantia de imutabilidade

### 3. Sequência - Gestão de Tokens

**Arquivo:** `sequencia_tokens.drawio`

**Descrição:** Diagrama de sequência mostrando a gestão dos três tipos de tokens do sistema: NiobiumToken (ERC721), CarbonCredit (ERC1155) e BatteryPassport (ERC721).

**Objetos/Componentes:**
- Minter/Admin (Ator)
- NiobiumToken (ERC721 - Lotes de nióbio)
- CarbonCredit (ERC1155 - Créditos de carbono)
- Auditor (Ator)
- BatteryPassport (ERC721 - Passaportes de bateria)
- Manufacturer (Ator)
- IPFS (Armazenamento de metadados)
- Blockchain (Ethereum)

**Cenários Cobertos:**

**Cenário 1: Criação de Lote de Nióbio**
- Mint de token ERC721
- Upload de metadados para IPFS
- Armazenamento do hash IPFS no contrato
- Emissão de evento BatchMinted

**Cenário 2: Criação de Crédito de Carbono**
- Mint de token ERC1155
- Verificação do lote de nióbio relacionado
- Emissão de evento CreditMinted
- Crédito fica pendente de verificação

**Cenário 3: Verificação de Crédito**
- Auditor verifica o crédito
- Validação de role (AUDITOR_ROLE)
- Marcação como verificado
- Emissão de evento CreditVerified

**Cenário 4: Criação de Passaporte de Bateria**
- Fabricante cria passaporte
- Verificação do lote de nióbio
- Upload de metadados para IPFS
- Mint de token ERC721
- Emissão de evento PassportCreated

**Cenário 5: Adicionar Componente**
- Adição de componentes ao passaporte
- Verificação de cada lote de nióbio
- Atualização da pegada de carbono

**Padrões de Token:**
- **NiobiumToken:** ERC721 (NFT único por lote)
- **CarbonCredit:** ERC1155 (múltiplos tipos de créditos)
- **BatteryPassport:** ERC721 (NFT único por bateria)

**Controle de Acesso:**
- MINTER_ROLE: Criar tokens
- AUDITOR_ROLE: Verificar créditos
- MANUFACTURER_ROLE: Criar passaportes
- ADMIN_ROLE: Gerenciar sistema

## 🛠️ Como Visualizar os Diagramas

### Opção 1: Draw.io Online (Recomendado)

1. Acesse [https://app.diagrams.net/](https://app.diagrams.net/)
2. Clique em "Open Existing Diagram"
3. Selecione "Device" ou "Open from"
4. Navegue até o arquivo `.drawio` desejado
5. O diagrama será carregado e pode ser editado

### Opção 2: Draw.io Desktop

1. Baixe o [Draw.io Desktop](https://github.com/jgraph/drawio-desktop/releases)
2. Instale no seu sistema
3. Abra o arquivo `.drawio` diretamente no aplicativo

### Opção 3: VS Code

1. Instale a extensão "Draw.io Integration" no VS Code
2. Abra o arquivo `.drawio`
3. O diagrama será renderizado no editor

### Opção 4: Exportar para Imagem

No draw.io:
1. File > Export as > PNG/SVG/JPEG
2. Escolha o formato desejado
3. Salve a imagem

## 📚 Referências

- [Documentação de Arquitetura](../ARQUITETURA.md)
- [Workflow de Supply Chain](../SUPPLY_CHAIN_WORKFLOW.md)
- [Guia de Deploy](../DEPLOYMENT_GUIDE.md)
- [Draw.io Documentation](https://www.drawio.com/doc)
- [UML Sequence Diagrams](https://www.uml-diagrams.org/sequence-diagrams.html)
- [UML Use Case Diagrams](https://www.uml-diagrams.org/use-case-diagrams.html)

## 🔄 Atualização dos Diagramas

Os diagramas devem ser atualizados sempre que:

- Novos casos de uso forem implementados
- O workflow de supply chain for modificado
- Novos contratos de tokens forem adicionados
- A arquitetura do sistema mudar significativamente

### Processo de Atualização

1. Abra o diagrama no draw.io
2. Faça as modificações necessárias
3. Salve o arquivo
4. Atualize este README se necessário
5. Commit as mudanças

## 📝 Notas Técnicas

### Formato dos Arquivos

Os arquivos estão em formato XML do draw.io, que é:
- Human-readable (texto plano)
- Version-friendly (diff-friendly)
- Compatível com todas as versões do draw.io
- Pode ser editado manualmente se necessário

### Estrutura dos Diagramas

Todos os diagramas seguem padrões consistentes:
- Cores para diferenciar tipos de elementos
- Tamanhos padronizados para melhor legibilidade
- Fontes consistentes
- Layout otimizado para exportação

### Convenções de Cores

- **Azul (#dae8fc):** Contratos principais e orquestradores
- **Verde (#d5e8d4):** Etapas implementadas e contratos de step
- **Amarelo (#fff2cc):** Funcionalidades propostas e sistemas de suporte
- **Roxo (#e1d5e7):** Sistemas auxiliares (QR Code, IPFS)
- **Vermelho (#f8cecc):** Blockchain e sistemas críticos

## 🤝 Contribuição

Para adicionar novos diagramas ou modificar os existentes:

1. Siga as convenções de cores e layout
2. Mantenha a consistência com os diagramas existentes
3. Atualize este README com as mudanças
4. Teste a visualização em diferentes plataformas
5. Documente novos cenários quando aplicável

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10b981,50:1a56db,100:0f172a&height=120&section=footer" width="100%" alt="Footer"/>
</p>

---
**Resumo:** Documentação completa dos diagramas UML do sistema NiobiumChain, incluindo casos de uso, sequência de supply chain e gestão de tokens, com instruções de visualização e manutenção.
**Data de Criação:** 2025-06-09
**Autor:** Rapport GenerAtiva
**Versão:** 1.0
**Última Atualização:** 2025-06-09
**Atualizado por:** Rapport GenerAtiva
**Histórico de Alterações:**
- 2025-06-09 - Criado por Rapport GenerAtiva - Versão 1.0
