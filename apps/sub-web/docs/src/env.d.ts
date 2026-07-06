/// <reference types="vite/client" />

declare module '*.md' {
  import type { DefineComponent } from 'vue';

  export const frontmatter: Record<string, unknown>;
  export const initialHtml: string;

  const component: DefineComponent;
  export default component;
}
