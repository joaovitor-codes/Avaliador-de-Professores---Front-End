import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Em desenvolvimento o Vite repassa /auth e /api para o back-end.
  // Assim front e API ficam na mesma origem e os cookies de sessão funcionam sem CORS.
  const apiTarget = env.API_PROXY_TARGET || 'http://localhost:3000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/auth': { target: apiTarget, changeOrigin: true },
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
  }
})
