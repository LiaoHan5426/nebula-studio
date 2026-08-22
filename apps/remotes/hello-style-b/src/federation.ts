import type {
  NebulaRemoteApplication,
  RemoteHandle,
  RemoteMountOptions,
} from '@nebula-studio/application-contract';

import { createApp, h } from 'vue';

import { CONTRACT_VERSION } from '@nebula-studio/application-contract';

import './poc.css';

export const nebulaHelloStyleBApplication: NebulaRemoteApplication = {
  contractVersion: CONTRACT_VERSION,
  async mount(options: RemoteMountOptions): Promise<RemoteHandle> {
    options.container.dataset.nebulaCss = 'hello-style-b';
    const app = createApp({
      render: () =>
        h('div', { class: 'poc-box', 'data-poc': 'hello-style-b' }, 'hello-b'),
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

export default nebulaHelloStyleBApplication;
