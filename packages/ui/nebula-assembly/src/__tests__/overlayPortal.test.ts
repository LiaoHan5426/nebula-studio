import { createApp, defineComponent, h, nextTick } from 'vue';

import { describe, expect, it } from 'vitest';

import { wrapWithAssemblyRoot } from '../components/wrapWithAssemblyRoot';
import { createNebulaComponentContext } from '../context/createNebulaComponentContext';
import { createHostAdapter } from '../host/createHostAdapters';
import { provideNebulaAssembly } from '../install/installNebulaAssembly';

describe('wrapWithAssemblyRoot overlay portal', () => {
  it('creates a body-level overlay container and removes it on unmount', async () => {
    const Root = defineComponent({
      setup() {
        return () => h('main', 'app');
      },
    });
    const Wrapped = wrapWithAssemblyRoot(Root);
    const app = createApp(Wrapped);
    const context = createNebulaComponentContext({
      host: createHostAdapter({ surface: 'platform-embed' }),
    });
    provideNebulaAssembly(app, context);
    app.mount(document.createElement('div'));
    await nextTick();

    const portal = document.body.querySelector(
      '[data-nebula-overlay-container]',
    );
    expect(portal).not.toBeNull();
    expect(context.overlay.teleportTarget.value).toBe(portal);

    app.unmount();
    expect(
      document.body.querySelector('[data-nebula-overlay-container]'),
    ).toBeNull();
    expect(context.overlay.teleportTarget.value).toBeNull();
  });
});
