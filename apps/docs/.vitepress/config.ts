import { defineConfig } from 'vitepress';

const buildNodeVersion = process.version.replace(/^v/, '');

/**
 * VitePress 静态站点（可选）。日常开发用 SPA：`vp run dev` → `dist-web`。
 * 需要 VitePress 时再：`vp run dev:vitepress` / `dist-vitepress`（与本包共用 Vite 解析图）。
 */
export default defineConfig({
  title: 'Nebula Studio Docs',
  description: '组件展示与交互验证',
  base: '/docs/',
  outDir: 'dist-vitepress',
  srcExclude: ['**/dist-web/**', '**/dist-vitepress/**'],
  vite: {
    /** 禁止加载同目录 `vite.config.ts`，否则会再注入一套 `@vitejs/plugin-vue`，导致默认主题 `.vue` 在管线中空载并触发解析错误。 */
    configFile: false,
    define: {
      __NEBULA_BUILD_NODE_VERSION__: JSON.stringify(buildNodeVersion),
    },
    resolve: {
      dedupe: ['vue'],
    },
    optimizeDeps: {
      include: ['marked'],
    },
    server: {
      port: 5175,
      strictPort: true,
    },
  },
});
