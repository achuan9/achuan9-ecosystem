import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { vitePluginVersionLog } from '@achuan9/vite-plugin-version-log'

export default defineConfig({
  plugins: [
    vue(),
    vitePluginVersionLog({
      // message: '当前版本信息',
      // emoji: '🚀'
    }),
  ],
})
