import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    fs: {
      // allow importing files from the repo root and this app
      allow: [
        resolve(__dirname, '.'),
        resolve(__dirname, '..', '..', '..'), // project root: .../google
        resolve(__dirname, '..', '..') // apps folder
      ]
    }
  }
})
