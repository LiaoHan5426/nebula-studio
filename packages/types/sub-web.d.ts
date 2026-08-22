// / <reference types="vite/client" />

/**
 * Shared sub-web renderer ambient types.
 * App-specific `Window.api` shapes stay in each app's `env.d.ts`.
 */

export type NebulaRuntimeMode = 'electron' | 'platform-embed' | 'standalone';

declare global {
  interface Window {
    __NEBULA_RUNTIME_MODE__?: NebulaRuntimeMode;
    __NEBULA_EMBED_SURFACE__?: string;
  }

  interface ImportMetaEnv {
    readonly VITE_APP_TITLE?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

declare module '@nebula-studio/nebula-flow-editor/components/BpmnEditor.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{
    mode?: 'default' | 'integration';
    xml?: string;
  }>;
  export default component;
}

declare module '@nebula-studio/nebula-flow-editor/components/IntegrationBpmnEditor.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{
    atomicInterfaces?: Array<{
      endpointUri?: string;
      interfaceId: string;
      interfaceName: string;
      method?: string;
    }>;
    xml?: string;
  }>;
  export default component;
}
