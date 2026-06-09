import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O site é publicado em http://carlosdelfino.eti.br/niobium-chain/
// Sem o `base` correto, os assets são referenciados na raiz (/assets/...) e
// retornam 404, deixando a página em branco. Em desenvolvimento, usamos '/'.
// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/niobium-chain/' : '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suprimir avisos de INVALID_ANNOTATION de dependências de terceiros
        if (warning.code === 'INVALID_ANNOTATION') {
          return
        }
        warn(warning)
      },
    },
  },
}))
