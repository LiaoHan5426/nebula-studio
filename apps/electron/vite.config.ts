import { resolve } from 'node:path';
import { defineConfig } from 'vite-plus';
import { nebulaStudioElectronPlugin } from '@nebula-studio/vite-electron-plugin';

const workspaceRoot = resolve(import.meta.dirname, '../..');

export default defineConfig({
  server: {
    port: 5176,
    strictPort: true,
  },
  pack: {
    format: ['cjs'],
    minify: true,
  },
  plugins: [
    nebulaStudioElectronPlugin({
      workspaceRoot,
      // 自动从 apps/app.config.ts 读取窗口配置和目录结构
      appConfigPath: 'apps/app.config.ts',
      startFrontendDevServer: true,
    }),
  ],
});
