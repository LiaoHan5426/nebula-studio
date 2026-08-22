import type {
  NebulaRemoteApplication,
  RemoteHandle,
  RemoteMountOptions,
} from '@nebula-studio/application-contract';

import { createApp, h } from 'vue';

import { CONTRACT_VERSION } from '@nebula-studio/application-contract';

import './poc.css';

export const nebulaHelloApplication: NebulaRemoteApplication = {
  contractVersion: CONTRACT_VERSION,
  async mount(options: RemoteMountOptions): Promise<RemoteHandle> {
    options.container.dataset.nebulaCss = 'hello';
    const app = createApp({
      render: () =>
        h('div', { class: 'poc-box', 'data-poc': 'hello' }, 'hello-a'),
    });
    app.mount(options.container);
    return {
      navigate() {},
      unmount() {
        app.unmount();
        options.container.replaceChildren();
        delete options.container.dataset.nebulaCss;
      },
    };
  },
};

export default nebulaHelloApplication;
