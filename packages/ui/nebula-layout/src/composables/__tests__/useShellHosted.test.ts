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
});
