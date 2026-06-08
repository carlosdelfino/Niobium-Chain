![visitors](https://visitor-badge.laobi.icu/badge?page_id=eduardo-pinheirop.niobiumchain-web3)
[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC_BY--SA_4.0-blue.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
![Language: Portuguese](https://img.shields.io/badge/Language-Portuguese-brightgreen.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)
![Ethereum](https://img.shields.io/badge/Ethereum-Smart%20Contracts-purple)
![Supply Chain](https://img.shields.io/badge/Supply%20Chain-Multi--Etapas-orange)
![DID](https://img.shields.io/badge/DID-Decentralized-green)
![Status](https://img.shields.io/badge/Status-Desenvolvimento-yellow)
![Repository Size](https://img.shields.io/github/repo-size/eduardo-pinheirop/niobiumchain-web3)
![Last Commit](https://img.shields.io/github/last-commit/eduardo-pinheirop/niobiumchain-web3)

<!-- Animated Header -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:1a56db,100:10b981&height=220&section=header&text=Workflow%20Supply%20Chain&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Sistema%20Multi-Etapas%20Dinâmico&descSize=18&descAlignY=55&descColor=94a3b8" width="100%" alt="Supply Chain Workflow Header"/>
</p>

## Workflow de Supply Chain - NiobiumChain

Este documento descreve o workflow completo do sistema de supply chain multi-etapas para rastreabilidade de nióbio, desde a mineração até o uso em veículos elétricos.

## 📊 Visão Geral do Workflow

O sistema implementa um workflow dinâmico e flexível que se adapta a diferentes rotas logísticas dependendo da origem, processamento e destino do nióbio.

```
Mineração → Transporte → Processamento → Embalagem → Porto → Embarque → 
Porto Destino → Transporte Final → Fabricação Bateria → Montagem Veículo → Entrega
```

## 🔄 Etapas da Cadeia de Suprimentos

### 1. Mineração (MINING)

**Contrato:** `MiningStep.sol`

**Propósito:** Rastreamento desde a extração do minério até o preparo para transporte.

**Dados Registrados:**
- Localização da mina (coordenadas GPS)
- Método de extração
- Quantidade extraída (kg)
- Teor do minério
- Relatório geológico
- Licença ambiental
- Data de extração
- Empresa de mineração

**Fluxo:**
```
1. Criar lote no SupplyChain com tipo MINING
2. Registrar dados de mineração no MiningStep
3. Gerar QR Code para o lote
4. Escanear QR Code para confirmar extração
5. CV Oracle verifica imagens da mina
6. Etapa marcada como COMPLETED
```

### 2. Transporte Terrestre (TRANSPORT)

**Contrato:** `TransportStep.sol`

**Propósito:** Rastreamento do transporte terrestre da mina até o local de processamento ou porto.

**Dados Registrados:**
- Tipo de veículo (caminhão, trem)
- ID do veículo/placa
- ID do motorista
- Rota planejada
- Distância (km)
- Duração estimada
- Local de partida e chegada
- Dados GPS (hash)
- Dados de temperatura (hash)
- Empresa de transporte

**Fluxo:**
```
1. Criar etapa TRANSPORT no SupplyChain
2. Iniciar transporte com dados do veículo
3. Gerar QR Code para o transporte
4. Escanear QR Code em checkpoints
5. CV Oracle verifica imagens do carregamento
6. Registrar dados GPS e temperatura
7. Marcar como COMPLETED ao chegar
```

### 3. Processamento Químico (PROCESSING)

**Contrato:** `ProcessingStep.sol`

**Propósito:** Transformação do minério em NTO (Óxido de Nióbio-Titânio) ou ferronióbio.

**Dados Registrados:**
- Local da instalação
- Tipo de processo (NTO, ferronióbio)
- Quantidade de entrada e saída
- Pureza final
- Fórmula química
- Relatório de qualidade
- Certificado de segurança
- Tempo de processamento
- Empresa de processamento

**Fluxo:**
```
1. Criar etapa PROCESSING no SupplyChain
2. Registrar dados do processamento
3. Gerar QR Code para o lote processado
4. CV Oracle verifica qualidade do produto
5. Analista químico aprova o processo
6. Etapa marcada como COMPLETED
```

### 4. Embalagem (PACKAGING)

**Contrato:** `PackagingStep.sol`

**Propósito:** Embalagem e rotulagem do produto final para transporte.

**Dados Registrados:**
- Tipo de embalagem
- Material da embalagem
- Número de pacotes
- Peso por pacote
- Informações do rótulo
- QR Code por pacote
- Código de barras
- Data de embalagem
- Empresa de embalagem

**Fluxo:**
```
1. Criar etapa PACKAGING no SupplyChain
2. Registrar dados de embalagem
3. Gerar QR Code único para cada pacote
4. CV Oracle verifica qualidade da embalagem
5. Escanear QR Codes de todos os pacotes
6. Etapa marcada como COMPLETED
```

### 5. Operações Portuárias (PORT_LOADING/PORT_UNLOADING)

**Contrato:** `PortStep.sol`

**Propósito:** Carregamento e descarregamento em portos.

**Dados Registrados:**
- Nome e código do porto
- Tipo de operação (LOADING/UNLOADING)
- ID do navio
- IDs dos contêineres
- Número de contêineres
- Declaração aduaneira
- Relatório de inspeção
- Tempo da operação
- Autoridade portuária

**Fluxo:**
```
1. Criar etapa PORT_LOADING no SupplyChain
2. Registrar dados do porto e navio
3. Gerar QR Code para cada contêiner
4. CV Oracle verifica carregamento
5. Aduaneira aprova declaração
6. Etapa marcada como COMPLETED
```

### 6. Embarque Marítimo (SHIPPING)

**Contrato:** `TransportStep.sol` (reutilizado)

**Propósito:** Transporte marítimo internacional.

**Dados Registrados:**
- ID do navio
- Rota marítima
- Distância náutica
- Duração estimada
- Portos de escala
- Condições do mar
- Empresa de navegação

**Fluxo:**
```
1. Criar etapa SHIPPING no SupplyChain
2. Iniciar transporte marítimo
3. Gerar QR Code para o navio
4. Escanear QR Code em cada porto de escala
5. CV Oracle verifica condições do carregamento
6. Marcar como COMPLETED ao chegar no destino
```

### 7. Descarregamento no Porto Destino (PORT_UNLOADING)

**Contrato:** `PortStep.sol` (reutilizado)

**Propósito:** Descarregamento no porto de destino.

**Fluxo similar ao carregamento, mas com tipo UNLOADING.**

### 8. Transporte Final (FINAL_TRANSPORT)

**Contrato:** `TransportStep.sol` (reutilizado)

**Propósito:** Transporte do porto destino até a fábrica de baterias.

**Fluxo similar ao transporte terrestre inicial.**

### 9. Fabricação de Baterias (MANUFACTURING)

**Contrato:** `BatteryTracking.sol`

**Propósito:** Fabricação de baterias individuais usando o nióbio processado.

**Dados Registrados:**
- Número de série único
- Modelo da bateria
- Capacidade (kWh)
- Voltagem (V)
- Química (NTO, etc)
- ID do lote de nióbio usado
- Fabricante
- Data de fabricação
- Expiração da garantia
- QR Code da bateria

**Fluxo:**
```
1. Criar bateria no BatteryTracking
2. Vincular ao lote de nióbio
3. Gerar QR Code único para a bateria
4. CV Oracle verifica qualidade da bateria
5. Criar etapa MANUFACTURING no SupplyChain
6. Etapa marcada como COMPLETED
```

### 10. Montagem em Veículos (ASSEMBLY)

**Contrato:** `VehicleTracking.sol` + `BatteryTracking.sol`

**Propósito:** Instalação da bateria em veículos elétricos.

**Dados Registrados (Veículo):**
- VIN (Vehicle Identification Number)
- Fabricante
- Modelo
- Ano
- Tipo de veículo
- Localização atual
- Proprietário atual

**Fluxo:**
```
1. Criar veículo no VehicleTracking
2. Instalar bateria no veículo
3. Gerar QR Code para o veículo
4. CV Oracle verifica instalação correta
5. Criar etapa ASSEMBLY no SupplyChain
6. Etapa marcada como COMPLETED
```

### 11. Entrega Final (DELIVERY)

**Contrato:** `VehicleTracking.sol`

**Propósito:** Entrega do veículo ao cliente final.

**Fluxo:**
```
1. Atualizar localização do veículo
2. Transferir propriedade para o cliente
3. Escanear QR Code final
4. Criar etapa DELIVERY no SupplyChain
5. Etapa marcada como COMPLETED
6. Workflow completo
```

## 🔐 Identidade Descentralizada (DiD)

### Propósito

Cada lote de nióbio recebe uma DID (Decentralized Identifier) única que serve como identidade imutável e verificável.

### Estrutura da DID

```
did:niobium:0x1234567890abcdef...
```

### Componentes

- **DID Document:** Contém metadados do lote
- **Public Key:** Para verificação de assinaturas
- **Authentication Methods:** Métodos de autenticação
- **Service Endpoints:** Endpoints para serviços

### Fluxo de DiD

```
1. Criar lote no SupplyChain
2. Gerar DID no NiobiumDID
3. Vincular DID ao lote
4. Assinar documentos com a DID
5. Verificar assinaturas em cada etapa
6. DID permanece imutável
```

## 📱 Sistema de QR Code

### Propósito

Cada etapa e cada item tem um QR Code único para verificação física e digital.

### Tipos de QR Code

1. **QR Code de Lote:** Identifica o lote inteiro
2. **QR Code de Etapa:** Identifica uma etapa específica
3. **QR Code de Pacote:** Identifica pacotes individuais
4. **QR Code de Bateria:** Identifica baterias individuais
5. **QR Code de Veículo:** Identifica veículos

### Fluxo de QR Code

```
1. Gerar QR Code no QRCodeSystem
2. Imprimir QR Code físico no item
3. Escanear QR Code em cada etapa
4. Verificar QR Code na blockchain
5. Registrar localização do escaneamento
6. QR Code marcado como escaneado
```

## 👁️ Computer Vision Oracle

### Propósito

Validação visual automatizada de etapas críticas usando Computer Vision.

### Casos de Uso

1. **Verificação de Mineração:** Confirmar tipo de minério
2. **Verificação de Carregamento:** Confirmar quantidade e qualidade
3. **Verificação de Processamento:** Confirmar pureza
4. **Verificação de Embalagem:** Confirmar integridade
5. **Verificação de Instalação:** Confirmar montagem correta

### Fluxo de CV Oracle

```
1. Capturar imagem da etapa
2. Upload para CV Oracle
3. Analisar imagem com ML
4. Detectar objetos e anomalias
5. Gerar relatório de análise
6. Submeter dados ao CVOracle.sol
7. Verificador aprova ou rejeita
8. Dados armazenados na blockchain
```

### Detecção de Anomalias

- Objetos não identificados
- Condições anormais
- Danos visíveis
- Falhas de qualidade
- Desvios de padrão

## 🔄 Workflow Flexível

### Adaptação a Rotas Diferentes

O sistema suporta rotas alternativas dependendo da origem e destino:

**Rota 1: Brasil → Europa**
```
Mineração (BR) → Transporte → Processamento (BR) → Embalagem → 
Porto (BR) → Embarque → Porto (EU) → Descarregamento → 
Transporte → Fabricação (EU) → Montagem → Entrega
```

**Rota 2: Brasil → China**
```
Mineração (BR) → Transporte → Processamento (BR) → Embalagem → 
Porto (BR) → Embarque → Porto (CN) → Descarregamento → 
Transporte → Fabricação (CN) → Montagem → Entrega
```

**Rota 3: Brasil → EUA**
```
Mineração (BR) → Transporte → Processamento (BR) → Embalagem → 
Porto (BR) → Embarque → Porto (US) → Descarregamento → 
Transporte → Fabricação (US) → Montagem → Entrega
```

### Configuração de Workflow

O workflow é configurado dinamicamente:

```solidity
// Criar lote com etapa inicial
uint256 batchId = supplyChain.createBatch(did, MINING, "Brazil");

// Adicionar próxima etapa
uint256 step1 = supplyChain.createStep(TRANSPORT, batchId, "To Processing", [batchId]);

// Adicionar etapa de processamento
uint256 step2 = supplyChain.createStep(PROCESSING, batchId, "Processing Plant", [step1]);

// Vincinar etapas
supplyChain.addNextStep(step1, step2);
```

### Pulando Etapas

Etapa podem ser puladas para rotas alternativas:

```solidity
// Pular etapa de processamento se já processado
supplyChain.skipStep(processingStepId);
```

## 📊 Rastreamento Completo

### Consulta de Histórico

```solidity
// Obter histórico completo de um lote
SupplyChain.Step[] memory history = supplyChain.getBatchHistory(batchId);

// Cada step contém:
// - Tipo da etapa
// - Status
// - Localização
// - QR Code
// - Dados de CV
// - Timestamps
```

### Rastreamento de Bateria para Veículo

```solidity
// Obter baterias de um lote
uint256[] memory batteries = batteryTracking.getBatteriesByBatch(batchId);

// Obter veículos que usam uma bateria
uint256[] memory vehicles = vehicleTracking.getBatteryVehicles(batteryId);

// Rastrear do nióbio ao veículo final
```

## 🔒 Segurança e Validação

### Validação em Cada Etapa

1. **QR Code:** Verificado antes de iniciar etapa
2. **DiD:** Assinatura verificada em cada transação
3. **CV Oracle:** Validação visual antes de completar
4. **Roles:** Apenas operadores autorizados podem executar
5. **Pausable:** Sistema pode ser pausado em emergências

### Detecção de Fraude

- QR Codes duplicados são rejeitados
- Assinaturas inválidas são bloqueadas
- Anomalias no CV são sinalizadas
- Etapas fora de ordem são prevenidas
- Tentativas de reutilização são detectadas

## 📈 Integração com Sistemas Externos

### APIs Disponíveis

1. **SupplyChain API:** Gerenciar workflow
2. **DID API:** Gerenciar identidades
3. **QR Code API:** Gerar e verificar QR Codes
4. **CV Oracle API:** Submeter e verificar imagens
5. **Battery API:** Rastrear baterias
6. **Vehicle API:** Rastrear veículos

### Webhooks

Eventos são emitidos para integração:

- `StepCreated` - Nova etapa criada
- `StepUpdated` - Etapa atualizada
- `QRScanned` - QR Code escaneado
- `CVDataSubmitted` - Dados de CV submetidos
- `AnomalyDetected` - Anomalia detectada
- `BatteryInstalled` - Bateria instalada
- `VehicleTransferred` - Veículo transferido

## 🎯 Casos de Uso

### Caso 1: Rastreamento de Lote Específico

```
1. Consultar DID do lote
2. Obter histórico completo
3. Verificar cada etapa
4. Confirmar validade de QR Codes
5. Revisar dados de CV
6. Validar assinaturas
```

### Caso 2: Recall de Bateria

```
1. Identificar bateria defeituosa
2. Rastrear até o lote de nióbio
3. Identificar todos os veículos afetados
4. Invalidar passaportes
5. Notificar proprietários
6. Iniciar recall
```

### Caso 3: Auditoria de Compliance

```
1. Selecionar período de auditoria
2. Consultar todos os lotes do período
3. Verificar documentação de cada etapa
4. Confirmar licenças e certificados
5. Validar dados de CV
6. Gerar relatório de compliance
```

## 📚 Referências

- [Documentação de Arquitetura](ARQUITETURA.md)
- [Guia de Auditoria de Segurança](SECURITY_AUDIT.md)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [DID Specification](https://www.w3.org/TR/did-core/)
- [EU Battery Regulation](https://ec.europa.eu/environment/topics/waste-and-recycling/batteries_en)

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10b981,50:1a56db,100:0f172a&height=120&section=footer" width="100%" alt="Footer"/>
</p>

---
**Resumo:** Documentação completa do workflow de supply chain multi-etapas do NiobiumChain, incluindo todas as etapas, integração com DiD, QR Code e Computer Vision.
**Data de Criação:** 2025-05-30
**Autor:** Rapport Generativa
**Versão:** 1.0
**Última Atualização:** 2025-05-30
**Atualizado por:** Rapport Generativa
**Histórico de Alterações:**
- 2025-05-30 - Criado por Rapport Generativa - Versão 1.0
