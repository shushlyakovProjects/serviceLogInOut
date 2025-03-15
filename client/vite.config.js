import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://26.126.134.249:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/,'')
      },
      '/socket.io':{
        target: 'http://26.126.134.249:4000',
        changeOrigin: true,
        ws: true,
      }
    }
  }
})
