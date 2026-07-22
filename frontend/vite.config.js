import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/health': {
        target: process.env.VITE_API_TARGET || 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/inventory': {
        target: process.env.VITE_API_TARGET || 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
  test:{
    exclude: ['e2e/**'],
    globals:true,
    environment: 'jsdom',
    setupFiles: [
      './src/setupTests.js',
      './src/__tests__/mockAPI.js'
    ]
  }
})
