import type {
  NebulaRemoteApplication,
  RemoteHandle,
  RemoteMountOptions,
} from '@nebula-studio/application-contract';
import type { LowCodeDraftDocument } from '@nebula-studio/low-code-contract';

import { createApp, defineComponent, h } from 'vue';

import { CONTRACT_VERSION } from '@nebula-studio/application-contract';
import {
  createMemoryDataSources,
  LowCodeEditor,
} from '@nebula-studio/editors-low-code';
import { createDemoBoardSnapshot } from '@nebula-studio/low-code-contract';
import { DESIGNER_PREVIEW_DATA } from '@nebula-studio/low-code-kit';
import '@nebula-studio/styles/remote';

import { ApprovalQueue } from './ApprovalQueue.ts';
import { DESIGNER_HARNESS_MARKER } from './designer-only.ts';
import {
  createHttpDraftPort,
  createStudioLifecycle,
  loadStudioCatalog,
  loadStudioDraft,
  TRUSTED_COMPONENT_LOCK,
} from './studioApi.ts';

import './studio.css';

export const nebulaLowCodeStudioDesigner: NebulaRemoteApplication = {
  contractVersion: CONTRACT_VERSION,
  async mount(options: RemoteMountOptions): Promise<RemoteHandle> {
    options.container.dataset.nebulaCss = 'low-code-studio';
    const snapshot = createDemoBoardSnapshot();
    const config =
      typeof options.application.runtimeConfig === 'object' &&
      options.application.runtimeConfig !== null &&
      !Array.isArray(options.application.runtimeConfig)
        ? (options.application.runtimeConfig as Record<string, unknown>)
        : undefined;
    const applicationId =
      typeof config?.applicationId === 'string'
        ? config.applicationId
        : typeof config?.definitionId === 'string'
          ? config.definitionId
          : 'demo-board';
    const fallback: LowCodeDraftDocument = {
      ...snapshot.definition,
      applicationId,
      draftId: `${applicationId}-draft`,
    };
    const [draft, catalog] = await Promise.all([
      loadStudioDraft(applicationId, fallback, options.capabilities),
      loadStudioCatalog(options.capabilities),
    ]);
    const lock = {
      components: {
        ...TRUSTED_COMPONENT_LOCK.components,
        ...snapshot.componentLock.components,
      },
    };
    const host = {
      catalog,
      dataSources: createMemoryDataSources(),
      drafts: createHttpDraftPort(
        applicationId,
        draft,
        options.capabilities,
        lock,
      ),
      studio: createStudioLifecycle(applicationId, options.capabilities),
    };
    const HarnessApp = defineComponent({
      name: 'LowCodeDesignerHarness',
      setup() {
        return () =>
          h('div', { class: 'lc-shell', 'data-lc-surface': 'designer' }, [
            h('div', { class: 'lc-shell__header' }, [
              h('div', { class: 'lc-shell__identity' }, [
                h(
                  'span',
                  { class: 'lc-shell__mark', 'aria-hidden': 'true' },
                  'L',
                ),
                h('div', {}, [
                  h('p', { class: 'lc-shell__eyebrow' }, 'Nebula Builder'),
                  h(
                    'h1',
                    {
                      class: 'lc-shell__title',
                      'data-lc-harness': DESIGNER_HARNESS_MARKER,
                    },
                    '低代码工作室',
                  ),
                  h(
                    'p',
                    { class: 'lc-shell__subtitle' },
                    '组合业务组件、校验数据绑定并发布受治理的应用版本',
                  ),
                ]),
              ]),
              h('div', { class: 'lc-shell__context' }, [
                h('span', { class: 'lc-shell__status' }, '草稿'),
                h('span', {}, applicationId),
              ]),
              h(ApprovalQueue, {
                applicationId,
                capabilities: options.capabilities,
              }),
            ]),
            h(LowCodeEditor, {
              host,
              componentLock: lock,
              context: { data: DESIGNER_PREVIEW_DATA },
            }),
          ]);
      },
    });
    const app = createApp(HarnessApp);
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

export default nebulaLowCodeStudioDesigner;
