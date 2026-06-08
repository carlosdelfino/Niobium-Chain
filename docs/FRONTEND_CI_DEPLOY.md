![visitors](https://visitor-badge.laobi.icu/badge?page_id=eduardo-pinheirop.niobiumchain-web3)
[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC_BY--SA_4.0-blue.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
![Language: Portuguese](https://img.shields.io/badge/Language-Portuguese-brightgreen.svg)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI_CD-blue)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-Build-orange)
![Status](https://img.shields.io/badge/Status-Desenvolvimento-yellow)
![Repository Size](https://img.shields.io/github/repo-size/eduardo-pinheirop/niobiumchain-web3)
![Last Commit](https://img.shields.io/github/last-commit/eduardo-pinheirop/niobiumchain-web3)

<!-- Animated Header -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:1a56db,100:10b981&height=220&section=header&text=CI%2FCD%20Frontend&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Deploy%20Automático%20via%20GitHub%20Actions&descSize=18&descAlignY=55&descColor=94a3b8" width="100%" alt="CI/CD Frontend Header"/>
</p>

## CI/CD - Deploy Automático do Frontend

Este documento descreve o processo de deploy automático do frontend via GitHub Actions, que gera um build de produção e commita no branch `page`.

## 🔄 Como Funciona

O workflow `.github/workflows/deploy-frontend.yml` é acionado automaticamente quando:

1. **Push nos branches main/master** - Deploy automático após cada push
2. **Manual** - Pode ser acionado manualmente via GitHub Actions UI

## 📋 Workflow

### Passos do Workflow

1. **Checkout do código** - Obtém o código do repositório
2. **Setup Node.js 18** - Configura ambiente Node.js
3. **Instalação de dependências** - `npm ci` no diretório frontend
4. **Build do frontend** - `npm run build` com variáveis de ambiente
5. **Configuração do Git** - Configura usuário para commits
6. **Checkout do branch page** - Cria ou acessa branch `page`
7. **Limpeza do branch** - Remove arquivos antigos
8. **Cópia do build** - Copia build para root do branch
9. **Commit e push** - Commita mudanças e push para branch `page`

## 🔐 Configuração de Secrets

Para o funcionamento correto, configure os seguintes secrets no GitHub:

### Acessar Secrets

1. Vá ao repositório no GitHub
2. Clique em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione cada secret abaixo

### Secrets Necessários

```env
# RPC URLs
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
VITE_MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Contract Addresses (atualizar após deploy)
VITE_SUPPLY_CHAIN_ADDRESS=0x...
VITE_NIOBIUM_DID_ADDRESS=0x...
VITE_BATTERY_TRACKING_ADDRESS=0x...
VITE_VEHICLE_TRACKING_ADDRESS=0x...

# WalletConnect (opcional)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

## 🚀 Deploy Automático

### Trigger Automático

O workflow é acionado automaticamente quando há push nos branches:

- `main`
- `master`

```bash
# Fazer push para acionar deploy
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

### Trigger Manual

Para acionar manualmente:

1. Vá ao repositório no GitHub
2. Clique em **Actions**
3. Selecione **Deploy Frontend to Page Branch**
4. Clique em **Run workflow**
5. Selecione o branch e clique em **Run**

## 📁 Estrutura do Branch Page

O branch `page` conterá:

```
page/
├── index.html          # Entry point
├── assets/             # Assets otimizados
│   ├── index-*.js     # JavaScript bundle
│   └── index-*.css    # CSS bundle
├── README.md          # README do branch page
└── ...                # Outros arquivos do build
```

## 🔍 Verificação do Deploy

### Verificar Status

1. Vá ao repositório no GitHub
2. Clique em **Actions**
3. Selecione o workflow mais recente
4. Verifique se todos os steps passaram

### Verificar Branch Page

1. Mude para o branch `page`:
```bash
git checkout page
```

2. Verifique os arquivos:
```bash
ls -la
```

3. Volte para o branch principal:
```bash
git checkout main
```

## 🌐 Hosting

O branch `page` pode ser hospedado em:

### GitHub Pages

1. Vá ao repositório → **Settings** → **Pages**
2. Em **Source**, selecione **Deploy from a branch**
3. Selecione branch `page` e pasta `/ (root)`
4. Clique em **Save**

O site estará disponível em:
```
https://username.github.io/niobiumchain-web3/
```

### Outras Opções

- **Netlify** - Conectar branch `page`
- **Vercel** - Conectar branch `page`
- **Cloudflare Pages** - Conectar branch `page`
- **IPFS** - Deploy via Fleek ou Pinata

## 🛠️ Troubleshooting

### Erro: "Secret not found"

**Problema:** Secret não configurado no GitHub.

**Solução:**
1. Vá em Settings → Secrets and variables → Actions
2. Adicione o secret faltante

### Erro: "Build failed"

**Problema:** Erro no build do frontend.

**Solução:**
1. Verifique os logs do workflow
2. Teste localmente: `cd frontend && npm run build`
3. Corrija erros e push novamente

### Erro: "Permission denied"

**Problema:** Permissões insuficientes do workflow.

**Solução:**
1. Verifique se `permissions: contents: write` está no workflow
2. Verifique se o workflow tem permissão no repositório

### Erro: "Branch conflict"

**Problema:** Conflito no branch `page`.

**Solução:**
O workflow usa `--force` para push, então conflitos são resolvidos automaticamente.

## 📊 Monitoramento

### Verificar Histórico de Deploys

1. Vá ao repositório → **Actions**
2. Clique em **Deploy Frontend to Page Branch**
3. Veja o histórico de runs

### Notificações

Configure notificações para:

- **Email** - Notificações de workflow
- **Slack** - Integração com Slack
- **Discord** - Webhook para Discord

## 🔧 Customização

### Mudar Branch de Destino

Edite `.github/workflows/deploy-frontend.yml`:

```yaml
- name: Create or checkout page branch
  run: |
    git checkout -b seu-branch || git checkout seu-branch
```

### Adicionar Testes

Adicione step de testes antes do build:

```yaml
- name: Run tests
  working-directory: ./frontend
  run: npm test
```

### Adicionar Lint

Adicione step de lint:

```yaml
- name: Run lint
  working-directory: ./frontend
  run: npm run lint
```

## 📝 Boas Práticas

1. **Sempre teste localmente** antes de push
2. **Use branches de feature** para desenvolvimento
3. **Review de código** antes de merge para main
4. **Monitore os workflows** regularmente
5. **Mantenha secrets atualizados**

## 🔄 Ciclo de Desenvolvimento

```
1. Desenvolvimento em branch feature
   ↓
2. Testes locais
   ↓
3. Pull Request para main
   ↓
4. Review e aprovação
   ↓
5. Merge para main
   ↓
6. Workflow acionado automaticamente
   ↓
7. Build e deploy para branch page
   ↓
8. Site atualizado
```

## 📚 Recursos

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)
- [React Deployment](https://react.dev/learn/deployment)

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10b981,50:1a56db,100:0f172a&height=120&section=footer" width="100%" alt="Footer"/>
</p>

---
**Resumo:** Documentação completa do CI/CD para deploy automático do frontend via GitHub Actions, incluindo configuração de secrets, workflow e troubleshooting.
**Data de Criação:** 2025-05-30
**Autor:** Rapport Generativa
**Versão:** 1.0
**Última Atualização:** 2025-05-30
**Atualizado por:** Rapport Generativa
**Histórico de Alterações:**
- 2025-05-30 - Criado por Rapport Generativa - Versão 1.0
