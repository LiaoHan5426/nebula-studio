/**
 * Nebula Vite `define`：与 `@nebula-studio-internal/vite` 的 `nebulaBuildNodeVersionDefine()` 一致。
 */
declare const __NEBULA_BUILD_NODE_VERSION__: string;

/**
 * MSW Mock 开关：由 `nebulaMswDefine()` 在构建时注入，仅 GitHub demo 部署为 `true`。
 */
declare const __NEBULA_MSW_ENABLED__: boolean;

/**
 * MSW Service Worker 基础路径：由 `nebulaMswDefine()` 在构建时注入，用于 GitHub Pages 子路径部署。
 */
declare const __NEBULA_MSW_BASE_PATH__: string;

type NebulaRuntimeMode = 'standalone' | 'platform-embed' | 'electron';

interface Window {
  __NEBULA_RUNTIME_MODE__?: NebulaRuntimeMode;
}

/**
 * 工作区侧效 CSS / 工具链入口：无运行时导出，由 `compilerOptions.types` 挂到各 renderer（见 `tools/tsconfig/web.json`）。
 */
declare module '@nebula-studio-internal/tailwind/electron';

/**
 * 全局设计令牌与基础样式（`packages/styles`），由 `@nebula-studio-internal/tailwind/electron` 链式引入。
 */
declare module '@nebula-studio/styles';

/**
 * @wangeditor/editor-for-vue：上游 exports 未声明 `types`，vue-tsc 在 moduleResolution bundler 下无法挂到 .d.ts。
 * 通过根链 `compilerOptions.types` 引入本包（见 @nebula-studio-internal/tsconfig web.json）。
 */
declare module '@wangeditor/editor-for-vue' {
  import type { DefineComponent } from 'vue';
  export const Editor: DefineComponent<object, object, unknown>;
  export const Toolbar: DefineComponent<object, object, unknown>;
}
