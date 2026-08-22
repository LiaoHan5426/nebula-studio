import { pocHostCapabilities } from '@nebula-studio/host-capabilities';

import { nebulaHelloApplication } from './federation.ts';

const root = document.querySelector('#app');
if (!(root instanceof HTMLElement)) {
  throw new Error('hello standalone missing #app');
}

void nebulaHelloApplication.mount({
  container: root,
  initialPath: '/',
  application: { id: 'hello', version: '0.0.0' },
  capabilities: pocHostCapabilities,
});
