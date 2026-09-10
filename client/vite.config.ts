import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-tanstack': ['@tanstack/react-query', '@tanstack/react-table'],
          'vendor-framer': ['framer-motion'],
          'vendor-emoji': ['emoji-mart', '@emoji-mart/data', '@emoji-mart/react'],
          'vendor-date': ['date-fns', 'react-day-picker'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
