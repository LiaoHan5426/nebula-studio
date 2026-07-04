export const SHELL_EMBED_RESET_MESSAGE = 'nebula-shell-embed-reset' as const;
export const SHELL_EMBED_RESET_ACK_MESSAGE =
  'nebula-shell-embed-reset-ack' as const;

export type ShellEmbedResetPayload = {
  type: typeof SHELL_EMBED_RESET_MESSAGE;
};

export type ShellEmbedResetAckPayload = {
  type: typeof SHELL_EMBED_RESET_ACK_MESSAGE;
};

export function isShellEmbedResetPayload(
  data: unknown,
): data is ShellEmbedResetPayload {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as ShellEmbedResetPayload).type === SHELL_EMBED_RESET_MESSAGE
  );
}

export function createShellEmbedResetPayload(): ShellEmbedResetPayload {
  return { type: SHELL_EMBED_RESET_MESSAGE };
}

export function isShellEmbedResetAckPayload(
  data: unknown,
): data is ShellEmbedResetAckPayload {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as ShellEmbedResetAckPayload).type === SHELL_EMBED_RESET_ACK_MESSAGE
  );
}

export function createShellEmbedResetAckPayload(): ShellEmbedResetAckPayload {
  return { type: SHELL_EMBED_RESET_ACK_MESSAGE };
}

/** 子应用 iframe 内：监听宿主发来的「回到首页」指令 */
export function installShellEmbedResetListener(
  onReset: () => void,
): () => void {
  const handler = (event: MessageEvent) => {
    if (event.source !== window.parent) return;
    if (event.origin !== window.location.origin) return;
    if (!isShellEmbedResetPayload(event.data)) return;
    onReset();
    window.parent.postMessage(
      createShellEmbedResetAckPayload(),
      window.location.origin,
    );
  };
  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}

/** 宿主壳：通知已挂载的子应用 iframe 回到首页（无需整页重载） */
export function postShellEmbedReset(
  contentWindow: Window | null | undefined,
  targetOrigin: string = window.location.origin,
): void {
  contentWindow?.postMessage(createShellEmbedResetPayload(), targetOrigin);
}
