import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// إعدادات Vite الأساسية لمشروع React
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
})
