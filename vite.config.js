import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/EBI/',
  publicDir: false,
  build: {
    outDir: 'build',
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})
