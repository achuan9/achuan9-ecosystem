import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    exclude: ['vue-load-deps'],
  },
  server: {
    watch: {
      usePolling: true,
    },
    hmr: {
      overlay: false,
    },
  },
})
