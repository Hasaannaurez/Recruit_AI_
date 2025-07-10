import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Accept requests from any host
    port: 5173,      // Optional, use the same dev port
  }
})