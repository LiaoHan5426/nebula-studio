import { resolve } from 'node:path';
import { defineConfig } from 'electron-vite';
import vue from '@vitejs/plugin-vue';

const electronRoot = import.meta.dirname;

export default defineConfig({
  main: {},
  preload: {
    build: {
      rollupOptions: {
        input: {
          main: resolve(electronRoot, '../electron-preload/main/src/index.ts'),
          pdm: resolve(electronRoot, '../electron-preload/pdm/src/index.ts'),
        },
        // Rolldown 仍可能打包子依赖里的 electron CLI 入口；强制不把 `electron` 打进 bundle。
        external: ['electron'],
      },
    },
  },
  renderer: {
    plugins: [vue()],
  },
});
