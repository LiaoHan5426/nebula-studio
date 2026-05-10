import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { defineConfig } from 'electron-vite';
import vue from '@vitejs/plugin-vue';

const require = createRequire(import.meta.url);

/** Resolve preload bundle entry via workspace package name (no `../electron-preload/…` segments). */
function preloadSrc(pkgName: string): string {
  return join(dirname(require.resolve(`${pkgName}/package.json`)), 'src/index.ts');
}

/** 与 `apps/docs/vite.config.ts` 一致，供 `apps/docs/src/main.ts` 传入 `installWebPresentation` */
const buildNodeVersion = process.version.replace(/^v/, '');

export default defineConfig({
  main: {
    build: {
      watch: {},
    },
  },
  preload: {
    build: {
      watch: {},
      rollupOptions: {
        input: {
          main: preloadSrc('@nebula-studio-preload/main'),
          docs: preloadSrc('@nebula-studio-preload/docs'),
          settings: preloadSrc('@nebula-studio-preload/settings'),
        },
        // Rolldown 仍可能打包子依赖里的 electron CLI 入口；强制不把 `electron` 打进 bundle。
        external: ['electron'],
      },
    },
  },
  renderer: {
    define: {
      __NEBULA_BUILD_NODE_VERSION__: JSON.stringify(buildNodeVersion),
    },
    plugins: [vue()],
    resolve: {
      dedupe: ['highlight.js', 'vue'],
    },
    optimizeDeps: {
      include: ['highlight.js/lib/common', 'marked'],
    },
  },
});
