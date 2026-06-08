![visitors](https://visitor-badge.laobi.icu/badge?page_id=eduardo-pinheirop.niobiumchain-web3)
[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC_BY--SA_4.0-blue.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
![Language: Portuguese](https://img.shields.io/badge/Language-Portuguese-brightgreen.svg)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Architecture](https://img.shields.io/badge/Architecture-Documentation-green)
![Status](https://img.shields.io/badge/Status-Desenvolvimento-yellow)
![Repository Size](https://img.shields.io/github/repo-size/eduardo-pinheirop/niobiumchain-web3)
![Last Commit](https://img.shields.io/github/last-commit/eduardo-pinheirop/niobiumchain-web3)

<!-- Animated Header -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:1a56db,100:10b981&height=220&section=header&text=Arquitetura%20Frontend&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Mapa%20Arquitetural%20para%20IA&descSize=18&descAlignY=55&descColor=94a3b8" width="100%" alt="Frontend Architecture Header"/>
</p>

## Mapa Arquitetural - Frontend NiobiumChain

Documentação do mapa arquitetural do frontend para facilitar intervenções da IA no código.

## 📊 Visão Geral

O arquivo `ARCHITECTURE.drawio` contém um diagrama visual da arquitetura do frontend React, mostrando:

- **Componentes principais** e suas relações
- **Fluxo de dados** entre componentes
- **Integrações externas** (Web3, MetaMask, contratos)
- **Dependências** e bibliotecas utilizadas

## 🗺️ Legenda do Diagrama

### Cores

- 🟦 **Roxo** - Componentes principais (App, Pages)
- 🟢 **Verde** - Providers/Context (Wagmi, Query)
- 🟡 **Amarelo** - Navegação/Estado
- 🔴 **Vermelho** - Componentes reutilizáveis
- 🟣 **Roxo claro** - Hooks personalizados
- 🟤 **Marrom** - Bibliotecas/Configuração
- 🔵 **Azul claro** - Dependências externas
- 🟠 **Laranja** - Serviços externos (MetaMask, Ethereum)

## 📁 Estrutura do Código

### 1. Entry Point

**Arquivo:** `src/App.tsx`

**Responsabilidade:**
- Componente raiz da aplicação
- Configura providers (Wagmi, Query)
- Gerencia navegação entre páginas
- Renderiza página ativa

**Pontos de Intervenção:**
- Adicionar novos providers
- Modificar lógica de navegação
- Adicionar rotas
- Configurar estado global

### 2. Pages (src/pages/)

#### Dashboard.tsx
**Responsabilidade:**
- Visão geral do sistema
- Estatísticas em tempo real
- Ações rápidas
- Atividade recente

**Dependências:**
- `useSupplyChain` hook
- Componentes Button, Header
- Lucide icons

**Pontos de Intervenção:**
- Adicionar novos cards de estatísticas
- Modificar ações rápidas
- Adicionar gráficos
- Integrar novos dados

#### SupplyChain.tsx
**Responsabilidade:**
- Busca de lotes
- Timeline visual
- Informações de workflow

**Dependências:**
- `useBatchHistory` hook
- Componentes Button, Header
- Lucide icons

**Pontos de Intervenção:**
- Adicionar filtros de busca
- Modificar visualização de timeline
- Adicionar detalhes de etapas
- Integrar novos dados de contrato

#### Batteries.tsx
**Responsabilidade:**
- Formulário de criação
- Busca de baterias
- Detalhes de bateria

**Dependências:**
- `useBatteryTracking` hook
- Componentes Button, Header
- Lucide icons

**Pontos de Intervenção:**
- Adicionar campos ao formulário
- Modificar validações
- Adicionar visualização de QR Code
- Integrar dados adicionais

#### Vehicles.tsx
**Responsabilidade:**
- Formulário de registro
- Busca de veículos
- Detalhes de veículo

**Dependências:**
- `useVehicleTracking` hook
- Componentes Button, Header
- Lucide icons

**Pontos de Intervenção:**
- Adicionar campos ao formulário
- Modificar validações
- Adicionar gerenciamento de baterias
- Integrar dados adicionais

### 3. Components (src/components/)

#### Button.tsx
**Responsabilidade:**
- Botão reutilizável
- Variantes (default, outline, ghost)
- Tamanhos (sm, md, lg)
- Suporte a ícones

**Pontos de Intervenção:**
- Adicionar novas variantes
- Modificar estilos
- Adicionar animações
- Modificar comportamento

#### Header.tsx
**Responsabilidade:**
- Header da aplicação
- Logo e navegação
- Integração com WalletConnect

**Pontos de Intervenção:**
- Modificar navegação
- Adicionar menus
- Modificar layout
- Adicionar elementos

#### WalletConnect.tsx
**Responsabilidade:**
- Conexão MetaMask
- Exibição de endereço
- Desconexão

**Dependências:**
- Wagmi hooks (useAccount, useConnect, useDisconnect)

**Pontos de Intervenção:**
- Adicionar conectores adicionais
- Modificar visualização
- Adicionar funcionalidades
- Integrar com outros wallets

### 4. Hooks (src/hooks/)

#### useSupplyChain.ts
**Responsabilidade:**
- Integração com contrato SupplyChain
- Criação de lotes
- Leitura de histórico

**Dependências:**
- Wagmi hooks (useReadContract, useWriteContract)
- contracts.ts (ABIs, endereços)

**Pontos de Intervenção:**
- Adicionar novas funções de contrato
- Modificar tratamento de erros
- Adicionar cache
- Modificar lógica de transação

#### useBatteryTracking.ts
**Responsabilidade:**
- Integração com contrato BatteryTracking
- Criação de baterias
- Leitura de informações

**Dependências:**
- Wagmi hooks (useReadContract, useWriteContract)
- contracts.ts (ABIs, endereços)

**Pontos de Intervenção:**
- Adicionar novas funções de contrato
- Modificar tratamento de erros
- Adicionar cache
- Modificar lógica de transação

#### useVehicleTracking.ts
**Responsabilidade:**
- Integração com contrato VehicleTracking
- Criação de veículos
- Leitura de informações

**Dependências:**
- Wagmi hooks (useReadContract, useWriteContract)
- contracts.ts (ABIs, endereços)

**Pontos de Intervenção:**
- Adicionar novas funções de contrato
- Modificar tratamento de erros
- Adicionar cache
- Modificar lógica de transação

### 5. Lib (src/lib/)

#### wagmi.ts
**Responsabilidade:**
- Configuração Wagmi
- Configuração de redes
- Configuração de conectores

**Pontos de Intervenção:**
- Adicionar novas redes
- Modificar conectores
- Adicionar configurações customizadas
- Modificar RPC URLs

#### contracts.ts
**Responsabilidade:**
- Definição de ABIs
- Endereços de contratos
- Tipos TypeScript

**Pontos de Intervenção:**
- Adicionar novos contratos
- Atualizar ABIs
- Modificar endereços
- Adicionar tipos

### 6. Utils (src/utils/)

#### cn.ts
**Responsabilidade:**
- Utilitário para classes CSS
- Combinação de Tailwind classes

**Pontos de Intervenção:**
- Adicionar utilitários
- Modificar lógica de combinação

## 🔗 Fluxo de Dados

### 1. Inicialização

```
App.tsx
  ↓
WagmiProvider (configura Web3)
  ↓
QueryClientProvider (configura React Query)
  ↓
Navigation (configura navegação)
  ↓
Renderiza página inicial (Dashboard)
```

### 2. Conexão Wallet

```
WalletConnect.tsx
  ↓
useAccount (Wagmi)
  ↓
useConnect (Wagmi)
  ↓
MetaMask (provider)
  ↓
Atualiza estado de conexão
```

### 3. Interação com Contratos

```
Page Component
  ↓
Custom Hook (useSupplyChain, etc)
  ↓
Wagmi Hooks (useReadContract, useWriteContract)
  ↓
contracts.ts (ABIs, endereços)
  ↓
Smart Contract (via RPC)
  ↓
Retorna dados para componente
```

## 🎯 Pontos de Entrada para IA

### Para Adicionar Nova Funcionalidade

1. **Identificar a página** onde a funcionalidade será adicionada
2. **Criar/modificar hook** se necessário interagir com contratos
3. **Atualizar contracts.ts** se necessário adicionar novo contrato
4. **Criar/modificar componente** se necessário novo UI
5. **Atualizar App.tsx** se necessário nova rota

### Para Modificar Contrato Existente

1. **Atualizar contracts.ts** com novo ABI
2. **Modificar hook correspondente** com novas funções
3. **Atualizar componentes** que usam o hook
4. **Testar integração**

### Para Adicionar Nova Página

1. **Criar novo arquivo** em `src/pages/`
2. **Criar hooks** se necessário
3. **Adicionar rota** em `App.tsx`
4. **Adicionar navegação** se necessário

### Para Modificar UI

1. **Identificar componente** a ser modificado
2. **Modificar componente** em `src/components/`
3. **Atualizar estilos** se necessário
4. **Testar em diferentes páginas**

## 📦 Dependências Externas

### Web3
- **Wagmi** - Integração Web3 React
- **Viem** - Biblioteca TypeScript Ethereum
- **MetaMask** - Wallet provider

### UI
- **React 19** - Biblioteca UI
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones

### Estado
- **TanStack Query** - Gerenciamento de estado assíncrono

## 🔍 Como Usar o Diagrama

### Para IA

1. **Abrir ARCHITECTURE.drawio** no draw.io
2. **Identificar componente** a ser modificado
3. **Seguir conexões** para entender dependências
4. **Localizar arquivo** correspondente na estrutura
5. **Fazer modificações** conforme necessário

### Para Desenvolvedores

1. **Visualizar arquitetura** geral
2. **Entender relações** entre componentes
3. **Identificar pontos** de intervenção
4. **Planejar modificações** antes de implementar

## 🛠️ Exemplos de Intervenção

### Exemplo 1: Adicionar Novo Campo em Formulário

**Localização:** `src/pages/Batteries.tsx`

**Passos:**
1. Abrir `Batteries.tsx`
2. Localizar formulário de criação
3. Adicionar novo campo no estado
4. Adicionar input no JSX
5. Atualizar chamada de hook se necessário

### Exemplo 2: Adicionar Nova Função de Contrato

**Localização:** `src/hooks/useSupplyChain.ts`

**Passos:**
1. Abrir `useSupplyChain.ts`
2. Adicionar nova função usando `useWriteContract`
3. Adicionar função de leitura usando `useReadContract` se necessário
4. Atualizar `contracts.ts` com novo ABI se necessário
5. Usar nova função em componente

### Exemplo 3: Modificar Estilo de Componente

**Localização:** `src/components/Button.tsx`

**Passos:**
1. Abrir `Button.tsx`
2. Modificar classes Tailwind
3. Adicionar nova variante se necessário
4. Testar em componentes que usam Button

## 📝 Notas Importantes

- **Todos os contratos** são acessados via Wagmi hooks
- **Variáveis de ambiente** estão em `.env`
- **Endereços de contratos** são carregados de `contracts.ts`
- **Estilos** usam Tailwind CSS
- **Ícones** são do Lucide React
- **Tipagem** é TypeScript estrita

## 🔗 Recursos

- [React Documentation](https://react.dev/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10b981,50:1a56db,100:0f172a&height=120&section=footer" width="100%" alt="Footer"/>
</p>

---
**Resumo:** Documentação do mapa arquitetural do frontend para facilitar intervenções da IA no código, incluindo estrutura, fluxo de dados e pontos de entrada.
**Data de Criação:** 2025-05-30
**Autor:** Rapport Generativa
**Versão:** 1.0
**Última Atualização:** 2025-05-30
**Atualizado por:** Rapport Generativa
**Histórico de Alterações:**
- 2025-05-30 - Criado por Rapport Generativa - Versão 1.0
