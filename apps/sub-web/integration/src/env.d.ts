// / <reference types="vite/client" />
// / <reference types="@nebula-studio/nebula-ui/env" />

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

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __NEBULA_RUNTIME_MODE__?: 'electron' | 'platform-embed' | 'standalone';
  __NEBULA_EMBED_SURFACE__?: string;
  electron: {
    ipcRenderer: {
      invoke(channel: string, ...args: unknown[]): Promise<unknown>;
      on(channel: string, listener: (...args: unknown[]) => void): void;
      removeListener(
        channel: string,
        listener: (...args: unknown[]) => void,
      ): void;
    };
  };
}
