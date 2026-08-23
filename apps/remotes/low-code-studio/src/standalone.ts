import { pocHostCapabilities } from '@nebula-studio/host-capabilities';

import { nebulaLowCodeStudioDesigner } from './application.ts';

const root = document.querySelector('#app');
if (!(root instanceof HTMLElement)) {
  throw new Error('low-code-studio standalone missing #app');
}

void nebulaLowCodeStudioDesigner.mount({
  container: root,
  initialPath: '/',
  application: { id: 'low-code-studio', version: '0.0.0' },
  capabilities: pocHostCapabilities,
});
