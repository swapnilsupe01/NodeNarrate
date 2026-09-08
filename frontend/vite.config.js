import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default function () {
  return defineConfig({
    plugins: [react()],
    base: './',
    server: {
      port: 5173,
    },
    build: {
      outDir: 'dist',
    },
  })
}
