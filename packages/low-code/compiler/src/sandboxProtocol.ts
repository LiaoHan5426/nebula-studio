export const SANDBOX_MESSAGE = {
  dispose: 'lc-sandbox-dispose',
  error: 'lc-sandbox-error',
  event: 'lc-sandbox-event',
  init: 'lc-sandbox-init',
  ready: 'lc-sandbox-ready',
  resize: 'lc-sandbox-resize',
  update: 'lc-sandbox-update',
} as const;

export type LowCodeSandboxHostMessage =
  | {
      data?: Record<string, unknown>;
      locale?: string;
      theme?: string;
      type: typeof SANDBOX_MESSAGE.init | typeof SANDBOX_MESSAGE.update;
    }
  | { type: typeof SANDBOX_MESSAGE.dispose };

export type LowCodeSandboxGuestMessage =
  | { height: number; type: typeof SANDBOX_MESSAGE.resize; width: number }
  | { message: string; type: typeof SANDBOX_MESSAGE.error }
  | { name: string; payload?: unknown; type: typeof SANDBOX_MESSAGE.event }
  | { type: typeof SANDBOX_MESSAGE.ready };

export const SANDBOX_SRCDOC = `<!doctype html><html><body>
<script>
parent.postMessage({ type: '${SANDBOX_MESSAGE.ready}' }, '*');
window.addEventListener('message', function (event) {
  var data = event.data || {};
  if (data.type === '${SANDBOX_MESSAGE.dispose}') {
    document.body.textContent = '';
    return;
  }
  if (data.type === '${SANDBOX_MESSAGE.init}' || data.type === '${SANDBOX_MESSAGE.update}') {
    parent.postMessage({ type: '${SANDBOX_MESSAGE.ready}' }, '*');
  }
});
</script>
</body></html>`;
