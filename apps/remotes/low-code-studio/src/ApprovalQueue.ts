import type { HostCapabilities } from '@nebula-studio/application-contract';

import { defineComponent, h, onMounted, ref } from 'vue';

import { approveStudioVersion, listStudioVersions } from './studioApi.ts';

export const ApprovalQueue = defineComponent({
  name: 'LowCodeApprovalQueue',
  props: {
    applicationId: { type: String, required: true },
    capabilities: {
      type: Object as () => HostCapabilities,
      required: true,
    },
  },
  setup(props) {
    const tickets = ref<
      {
        applicationId: string;
        rolloutPercent: number;
        status: string;
        version: string;
      }[]
    >([]);
    const error = ref('');
    const busy = ref('');

    const load = async () => {
      error.value = '';
      try {
        const rows = await listStudioVersions(
          props.applicationId,
          props.capabilities,
        );
        tickets.value = rows.filter((row) => row.status === 'PENDING');
      } catch (cause) {
        error.value = cause instanceof Error ? cause.message : String(cause);
        tickets.value = [];
      }
    };

    const approve = async (version: string) => {
      busy.value = version;
      try {
        await approveStudioVersion(
          props.applicationId,
          version,
          props.capabilities,
        );
        await load();
      } catch (cause) {
        error.value = cause instanceof Error ? cause.message : String(cause);
      } finally {
        busy.value = '';
      }
    };

    onMounted(() => {
      void load();
    });

    return () =>
      h('section', { class: 'lc-approval', 'data-lc-approval-queue': 'true' }, [
        h('h2', { class: 'lc-approval__title' }, '审批工单'),
        error.value
          ? h('p', { class: 'lc-approval__error', role: 'alert' }, error.value)
          : null,
        tickets.value.length === 0
          ? h('p', { class: 'lc-approval__empty' }, '暂无待审批版本')
          : h(
              'ul',
              { class: 'lc-approval__list' },
              tickets.value.map((ticket) =>
                h('li', { key: ticket.version, class: 'lc-approval__item' }, [
                  h(
                    'span',
                    {},
                    `${ticket.version} · ${String(ticket.rolloutPercent)}%`,
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      disabled: busy.value === ticket.version,
                      onClick: () => {
                        void approve(ticket.version);
                      },
                    },
                    busy.value === ticket.version ? '审批中…' : '通过',
                  ),
                ]),
              ),
            ),
      ]);
  },
});
