import { createApp, defineComponent, h, nextTick } from 'vue';

import {
  createHostAdapter,
  createNebulaComponentContext,
  provideNebulaAssembly,
} from '@nebula-studio/nebula-assembly';

import { describe, expect, it } from 'vitest';

import { useShellHosted } from '../useShellHosted';

describe('useShellHosted', () => {
  it('reads platform-embed from assembly as shell-hosted', async () => {
    let hosted: boolean | undefined;
    const Child = defineComponent({
      setup() {
        hosted = useShellHosted().isShellHosted.value;
        return () => h('span');
      },
    });
    const app = createApp(Child);
    provideNebulaAssembly(
      app,
      createNebulaComponentContext({
        host: createHostAdapter({ surface: 'platform-embed' }),
      }),
    );
    app.mount(document.createElement('div'));
    await nextTick();
    expect(hosted).toBe(true);
    app.unmount();
  });

  it('reads standalone from assembly as not shell-hosted', async () => {
    let hosted: boolean | undefined;
    const Child = defineComponent({
      setup() {
        hosted = useShellHosted().isShellHosted.value;
        return () => h('span');
      },
    });
    const app = createApp(Child);
    provideNebulaAssembly(
      app,
      createNebulaComponentContext({
        host: createHostAdapter({ surface: 'standalone' }),
      }),
    );
    app.mount(document.createElement('div'));
    await nextTick();
    expect(hosted).toBe(false);
    app.unmount();
  });

  it('treats electron iframe remotes as shell-hosted', async () => {
    const originalParent = window.parent;
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: { closed: false },
    });
    window.history.replaceState({}, '', '/?renderer=docs');

    let hosted: boolean | undefined;
    const Child = defineComponent({
      setup() {
        hosted = useShellHosted().isShellHosted.value;
        return () => h('span');
      },
    });
    const app = createApp(Child);
    provideNebulaAssembly(
      app,
      createNebulaComponentContext({
        host: createHostAdapter({ surface: 'electron' }),
      }),
    );
    app.mount(document.createElement('div'));
    await nextTick();
    expect(hosted).toBe(true);
    app.unmount();

    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: originalParent,
    });
    window.history.replaceState({}, '', '/');
  });
});
