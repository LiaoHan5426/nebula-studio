import { pocHostCapabilities } from '@nebula-studio/host-capabilities';

import { nebulaHelloStyleBApplication } from './federation.ts';

const root = document.querySelector('#app');
if (!(root instanceof HTMLElement)) {
  throw new Error('hello-style-b standalone missing #app');
}

void nebulaHelloStyleBApplication.mount({
  container: root,
  initialPath: '/',
  application: { id: 'hello-style-b', version: '0.0.0' },
  capabilities: pocHostCapabilities,
});
