import type { Ref } from 'vue';

import { createApp, defineComponent, h, inject, nextTick } from 'vue';

import { overlayContainerKey } from '@nebula-studio/nebula-ui';

import { describe, expect, it } from 'vitest';

import { createNebulaComponentContext } from '../context/createNebulaComponentContext';
import { tryUseNebulaAssembly } from '../context/useNebulaAssembly';
import { createEditorHost } from '../editor/createEditorHost';
import { createHostAdapter } from '../host/createHostAdapters';
import { provideNebulaAssembly } from '../install/installNebulaAssembly';
import { createOverlayService } from '../overlay/createOverlayService';

describe('assembly context', () => {
  it('shares overlay and editor host across two host adapters', async () => {
    const overlay = createOverlayService();
    const editor = createEditorHost('light');

    const hostA = createHostAdapter({ surface: 'standalone' });
    const hostB = createHostAdapter({ surface: 'platform-embed' });

    const contextA = createNebulaComponentContext({
      host: hostA,
      overlay,
      editor,
    });
    const contextB = createNebulaComponentContext({
      host: hostB,
      overlay,
      editor,
    });

    expect(contextA.overlay).toBe(contextB.overlay);
    expect(contextA.editor).toBe(contextB.editor);

    const confirmPromise = overlay.confirm('Delete item?');
    expect(overlay.confirmState.open).toBe(true);
    overlay.answerConfirm(true);
    await expect(confirmPromise).resolves.toBe(true);
  });

  it('provides assembly via Vue app', async () => {
    let captured: ReturnType<typeof tryUseNebulaAssembly> | undefined;
    const Child = defineComponent({
      setup() {
        captured = tryUseNebulaAssembly();
        return () => h('span', 'child');
      },
    });
    const Root = defineComponent({
      setup() {
        return () => h(Child);
      },
    });

    const app = createApp(Root);
    const context = createNebulaComponentContext({
      host: createHostAdapter({ surface: 'standalone' }),
    });
    provideNebulaAssembly(app, context);
    app.mount(document.createElement('div'));
    await nextTick();

    expect(captured).toBe(context);
    app.unmount();
  });

  it('provides the nebula-ui overlay container key', async () => {
    let captured: Ref<HTMLElement | null> | undefined;
    const Child = defineComponent({
      setup() {
        captured = inject(overlayContainerKey);
        return () => h('span');
      },
    });
    const app = createApp(Child);
    const context = createNebulaComponentContext({
      host: createHostAdapter({ surface: 'standalone' }),
    });
    const host = document.createElement('div');
    context.overlay.setTeleportTarget(host);
    provideNebulaAssembly(app, context);
    app.mount(document.createElement('div'));
    await nextTick();

    expect(captured?.value).toBe(host);
    app.unmount();
  });

  it('editor host configure and save stub work', async () => {
    const editor = createEditorHost('dark');
    let saved = false;
    editor.configure({
      readonly: true,
      size: { height: '480px' },
      save: () => {
        saved = true;
      },
    });

    expect(editor.readonly.value).toBe(true);
    expect(editor.size.value.height).toBe('480px');
    expect(editor.theme.value).toBe('dark');

    await editor.save();
    expect(saved).toBe(true);

    editor.diagnostics.push({ level: 'info', message: 'ok' });
    expect(editor.diagnostics.messages.value).toHaveLength(1);
    await expect(editor.resourcePicker.open()).resolves.toBeNull();
  });
});
