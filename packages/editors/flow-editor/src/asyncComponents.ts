import { defineAsyncComponent } from 'vue';

import type BpmnEditorSfc from './components/BpmnEditor.vue';
import type IntegrationBpmnEditorSfc from './components/IntegrationBpmnEditor.vue';

export const BpmnEditor = defineAsyncComponent(
  () => import('./components/BpmnEditor.vue'),
) as unknown as typeof BpmnEditorSfc;

export const IntegrationBpmnEditor = defineAsyncComponent(
  () => import('./components/IntegrationBpmnEditor.vue'),
) as unknown as typeof IntegrationBpmnEditorSfc;
