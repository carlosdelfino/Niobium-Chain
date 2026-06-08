# NiobiumChain Frontend

Frontend React + TypeScript para o sistema de rastreabilidade de supply chain de nióbio com integração MetaMask.

## 🚀 Tecnologias

- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Wagmi** - Biblioteca Web3 React
- **Viem** - Biblioteca TypeScript Ethereum
- **TanStack Query** - Gerenciamento de estado assíncrono
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- MetaMask instalado no navegador

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas configurações
# - RPC URLs
# - Endereços dos contratos
# - WalletConnect Project ID (opcional)
```

## 🏃 Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📱 Funcionalidades

### Dashboard
- Visão geral do sistema
- Estatísticas em tempo real
- Ações rápidas (criar lote, registrar bateria, registrar veículo)
- Atividade recente

### Supply Chain
- Busca de lotes por ID
- Timeline visual do workflow
- Status de cada etapa
- Informações detalhadas do processo

### Baterias
- Criação de novas baterias
- Busca por ID
- Detalhes completos (capacidade, voltagem, química, etc)
- Rastreamento de QR Code

### Veículos
- Registro de novos veículos
- Busca por ID
- Detalhes completos (VIN, fabricante, modelo, etc)
- Gerenciamento de baterias instaladas

## 🔗 Integração com Contratos

O frontend se conecta aos smart contracts através do Wagmi:

- **SupplyChain.sol** - Gerenciamento de workflow
- **NiobiumDID.sol** - Identidade descentralizada
- **BatteryTracking.sol** - Rastreamento de baterias
- **VehicleTracking.sol** - Rastreamento de veículos

## 🦊 MetaMask

Para usar o aplicativo:

1. Instale a extensão MetaMask
2. Crie ou importe uma carteira
3. Adicione a rede Sepolia (testnet) ou Mainnet
4. Conecte a carteira clicando no botão "Conectar MetaMask"
5. Aprove as transações quando solicitado

## 📄 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Header.tsx
│   │   └── WalletConnect.tsx
│   ├── hooks/           # Hooks personalizados
│   │   ├── useSupplyChain.ts
│   │   ├── useBatteryTracking.ts
│   │   └── useVehicleTracking.ts
│   ├── lib/             # Bibliotecas e configurações
│   │   ├── wagmi.ts
│   │   └── contracts.ts
│   ├── pages/           # Páginas principais
│   │   ├── Dashboard.tsx
│   │   ├── SupplyChain.tsx
│   │   ├── Batteries.tsx
│   │   └── Vehicles.tsx
│   ├── utils/           # Utilitários
│   │   └── cn.ts
│   ├── App.tsx          # Componente principal
│   └── index.css        # Estilos globais
├── public/              # Arquivos estáticos
├── .env.example         # Exemplo de variáveis de ambiente
└── package.json         # Dependências
```

## 🔐 Variáveis de Ambiente

```env
# RPC URLs
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
VITE_MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Contract Addresses
VITE_SUPPLY_CHAIN_ADDRESS=0x...
VITE_NIOBIUM_DID_ADDRESS=0x...
VITE_BATTERY_TRACKING_ADDRESS=0x...
VITE_VEHICLE_TRACKING_ADDRESS=0x...

# WalletConnect (opcional)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

## 🧪 Testes

```bash
# Executar testes (quando implementados)
npm run test
```

## 📦 Build

```bash
# Build para produção
npm run build

# O build será gerado na pasta dist/
```

## 🚀 Deploy

O frontend pode ser deployado em:

- **Vercel** - `vercel deploy`
- **Netlify** - `netlify deploy --prod`
- **GitHub Pages** - Configurar actions
- **IPFS** - Para descentralização

## 📚 Recursos

- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MetaMask Documentation](https://docs.metamask.io/)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença CC BY-SA 4.0.
