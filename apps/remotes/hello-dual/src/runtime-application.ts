import type {
  NebulaRemoteApplication,
  RemoteHandle,
  RemoteMountOptions,
} from '@nebula-studio/application-contract';

import { createApp, h } from 'vue';

import { CONTRACT_VERSION } from '@nebula-studio/application-contract';

export const nebulaHelloDualRuntime: NebulaRemoteApplication = {
  contractVersion: CONTRACT_VERSION,
  async mount(options: RemoteMountOptions): Promise<RemoteHandle> {
    options.container.dataset.nebulaCss = 'hello-dual';
    const app = createApp({
      render: () => h('div', { 'data-poc': 'dual-runtime' }, 'runtime-ok'),
    });
    app.mount(options.container);
    return {
      navigate() {},
      unmount() {
        app.unmount();
        options.container.replaceChildren();
      },
    };
  },
};

export default nebulaHelloDualRuntime;
