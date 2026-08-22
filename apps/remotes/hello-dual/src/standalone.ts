import { pocHostCapabilities } from '@nebula-studio/host-capabilities';

import { nebulaHelloDualDesigner } from './application.ts';

const root = document.querySelector('#app');
if (!(root instanceof HTMLElement)) {
  throw new Error('hello-dual standalone missing #app');
}

void nebulaHelloDualDesigner.mount({
  container: root,
  initialPath: '/',
  application: { id: 'hello-dual', version: '0.0.0' },
  capabilities: pocHostCapabilities,
});
