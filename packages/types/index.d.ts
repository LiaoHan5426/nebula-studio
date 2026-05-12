/**
 * @wangeditor/editor-for-vue：上游 exports 未声明 `types`，vue-tsc 在 moduleResolution bundler 下无法挂到 .d.ts。
 * 通过根链 `compilerOptions.types` 引入本包（见 @nebula-studio-internal/tsconfig web.json）。
 */
declare module '@wangeditor/editor-for-vue' {
  import type { DefineComponent } from 'vue';
  export const Editor: DefineComponent<object, object, unknown>;
  export const Toolbar: DefineComponent<object, object, unknown>;
}
