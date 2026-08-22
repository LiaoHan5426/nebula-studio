import type DagEditorSfc from './components/DagEditor.vue';

import { defineAsyncComponent } from 'vue';

export const DagEditor = defineAsyncComponent(
  () => import('./components/DagEditor.vue'),
) as unknown as typeof DagEditorSfc;
