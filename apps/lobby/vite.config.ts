import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/sudoku': {
        target: 'http://127.0.0.1:5174',
        changeOrigin: true,
      },
      '/minesweeper': {
        target: 'http://127.0.0.1:5175',
        changeOrigin: true,
      }
    }
  }
})
