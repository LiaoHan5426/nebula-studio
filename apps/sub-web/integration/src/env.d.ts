/// <reference types="vite/client" />

declare module '@nebula-studio/nebula-flow-editor/components/BpmnEditor.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{
    xml?: string;
    mode?: 'default' | 'integration';
  }>;
  export default component;
}

declare module '@nebula-studio/nebula-flow-editor/components/IntegrationBpmnEditor.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{
    xml?: string;
    atomicInterfaces?: Array<{
      interfaceId: string;
      interfaceName: string;
      endpointUri?: string;
      method?: string;
    }>;
  }>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
