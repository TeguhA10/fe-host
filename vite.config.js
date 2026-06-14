import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.js.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: '/src',
    },
  },
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/api'),
      },
      '/api/employee': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/employee/, '/api'),
      },
      '/api/purchasing': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/purchasing/, '/api'),
      },
    },
  },
})
