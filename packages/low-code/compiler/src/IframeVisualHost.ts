import type { LowCodeSandboxGuestMessage } from './sandboxProtocol.ts';

import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue';

import { SANDBOX_MESSAGE, SANDBOX_SRCDOC } from './sandboxProtocol.ts';
import { recordSandboxCircuitOpen } from './sandboxTelemetry.ts';

export const IframeVisualHost = defineComponent({
  name: 'LowCodeIframeVisualHost',
  props: {
    nodeId: { type: String, required: true },
    locale: { type: String, default: 'zh-CN' },
    theme: { type: String, default: 'dark' },
    data: {
      type: Object as () => Record<string, unknown>,
      default: () => ({}),
    },
  },
  setup(props) {
    const failed = ref('');
    const frame = ref<HTMLIFrameElement | null>(null);

    const onMessage = (event: MessageEvent<LowCodeSandboxGuestMessage>) => {
      if (event.source !== frame.value?.contentWindow) {
        return;
      }
      const payload = event.data;
      if (payload?.type === SANDBOX_MESSAGE.error) {
        failed.value = payload.message || 'sandbox error';
        recordSandboxCircuitOpen(props.nodeId);
      }
    };

    onMounted(() => {
      window.addEventListener('message', onMessage);
      frame.value?.contentWindow?.postMessage(
        {
          type: SANDBOX_MESSAGE.init,
          theme: props.theme,
          locale: props.locale,
          data: props.data,
        },
        '*',
      );
    });

    onBeforeUnmount(() => {
      window.removeEventListener('message', onMessage);
      frame.value?.contentWindow?.postMessage(
        { type: SANDBOX_MESSAGE.dispose },
        '*',
      );
    });

    return () =>
      failed.value
        ? h(
            'div',
            {
              class: 'lc-error',
              role: 'alert',
              'data-lc-sandbox-circuit': props.nodeId,
            },
            failed.value,
          )
        : h('iframe', {
            ref: frame,
            class: 'lc-sandbox',
            'data-lc-sandbox': props.nodeId,
            sandbox: 'allow-scripts',
            srcdoc: SANDBOX_SRCDOC,
            title: `sandbox-${props.nodeId}`,
          });
  },
});
