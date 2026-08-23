import type {
  NebulaRemoteApplication,
  RemoteHandle,
  RemoteMountOptions,
} from '@nebula-studio/application-contract';
import type { LowCodeRuntimeSnapshot } from '@nebula-studio/low-code-contract';

import { createApp, defineComponent, h, onMounted, ref } from 'vue';

import { CONTRACT_VERSION } from '@nebula-studio/application-contract';
import {
  createDemoBoardSnapshot,
  DEMO_BOARD_APPLICATION_ID,
  DEMO_BOARD_VERSION,
  readRuntimeSnapshotPayload,
} from '@nebula-studio/low-code-contract';
import '@nebula-studio/styles/remote';

import { StudioSurface } from './StudioSurface.ts';

import './studio.css';

function runtimeConfigRecord(
  value: unknown,
): Record<string, unknown> | undefined {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

async function loadSnapshot(
  applicationId: string,
  version: string,
): Promise<LowCodeRuntimeSnapshot> {
  const response = await fetch(
    `/api/low-code/runtime/${encodeURIComponent(applicationId)}/versions/${encodeURIComponent(version)}`,
  );
  if (!response.ok) {
    throw new Error(`runtime snapshot HTTP ${String(response.status)}`);
  }
  return readRuntimeSnapshotPayload(await response.json());
}

const RuntimeApp = defineComponent({
  name: 'LowCodeRuntimeApp',
  props: {
    applicationId: { type: String, required: true },
    version: { type: String, required: true },
  },
  setup(props) {
    const snapshot = ref<LowCodeRuntimeSnapshot | null>(null);
    const error = ref('');
    onMounted(async () => {
      try {
        snapshot.value = await loadSnapshot(props.applicationId, props.version);
      } catch (cause) {
        error.value =
          cause instanceof Error ? cause.message : 'runtime snapshot failed';
        snapshot.value = createDemoBoardSnapshot();
      }
    });
    return () => {
      if (!snapshot.value) {
        return h('div', { 'data-lc-surface': 'runtime' }, error.value || '…');
      }
      return h('div', { 'data-lc-surface': 'runtime' }, [
        error.value
          ? h('p', { role: 'status' }, `fallback fixture: ${error.value}`)
          : null,
        h(StudioSurface, {
          definition: snapshot.value.definition,
          componentLock: snapshot.value.componentLock,
          context: {
            data: { title: '运营大屏', metrics: { orders: 41 }, alerts: [] },
          },
          mode: 'runtime',
        }),
      ]);
    };
  },
});

export const nebulaLowCodeStudioRuntime: NebulaRemoteApplication = {
  contractVersion: CONTRACT_VERSION,
  async mount(options: RemoteMountOptions): Promise<RemoteHandle> {
    options.container.dataset.nebulaCss = 'low-code-studio';
    const config = runtimeConfigRecord(options.application.runtimeConfig);
    const applicationId =
      typeof config?.definitionId === 'string'
        ? config.definitionId
        : typeof config?.applicationId === 'string'
          ? config.applicationId
          : options.application.id || DEMO_BOARD_APPLICATION_ID;
    const version =
      typeof config?.definitionVersion === 'string'
        ? config.definitionVersion
        : DEMO_BOARD_VERSION;
    const app = createApp(RuntimeApp, { applicationId, version });
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

export default nebulaLowCodeStudioRuntime;
