import { defineAsyncComponent } from 'vue';

import type DagEditorSfc from './components/DagEditor.vue';

export const DagEditor = defineAsyncComponent(
  () => import('./components/DagEditor.vue'),
) as unknown as typeof DagEditorSfc;
