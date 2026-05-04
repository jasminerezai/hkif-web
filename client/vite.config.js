// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    // The port frontend runs on (default)

    proxy: {
      '/api': {
        // Any fetch('/api/...') call in your React code gets
        // forwarded here during development.
        // So fetch('/api/auth/login') becomes:
        //   http://localhost:3001/api/auth/login
        target: 'http://localhost:3001',

        changeOrigin: true,
        // Makes the request look like it came from localhost:3001
        // instead of localhost:5173 — prevents CORS errors.
      },
    },
  },
})