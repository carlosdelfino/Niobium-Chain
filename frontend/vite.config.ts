import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O site é publicado no GitHub Pages em https://<user>.github.io/niobiumchain-web3/.
// Sem o `base` correto, os assets são referenciados na raiz (/assets/...) e
// retornam 404, deixando a página em branco. Em desenvolvimento, usamos '/'.
// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/niobiumchain-web3/' : '/',
  plugins: [react()],
}))
