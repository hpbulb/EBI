import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // resolve: {
  //   alias: {
  //     react: path.resolve(__dirname, 'node_modules/react'),
  //     'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
  //   },
  //   dedupe: ['react', 'react-dom'],
  // },
  // },
  base: process.env.VITE_BASE_PATH ?? (process.env.VERCEL ? '/' : '/EBI/'),
  publicDir: false,
  build: {
  outDir: 'build',
},
  server: {
  host: 'localhost',
  port: 5173,
  hmr: {
    host: 'localhost',
    protocol: 'ws',
  },
  proxy: {
    '/EBI/backend': {
      target: 'http://127.0.0.1',
      changeOrigin: true,
    },
    '/backend': {
      target: 'http://127.0.0.1',
      changeOrigin: true,
      rewrite: (path) => `/EBI${path}`,
    },
  },
},
  plugins: [
  react(),
  tailwindcss(),
],
})
