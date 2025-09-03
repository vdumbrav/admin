import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// Use VITE_PUBLIC_BASE for GH Pages builds
const base = process.env.VITE_PUBLIC_BASE ?? '/admin/'

export default defineConfig({
  base,
  server: {
    port: 3000,
  },
  plugins: [
    react(),
    tanstackRouter({ routesDirectory: 'src/routes' }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
})
