export const SHELL_EMBED_RESET_MESSAGE = 'nebula-shell-embed-reset' as const;
export const SHELL_EMBED_RESET_ACK_MESSAGE =
  'nebula-shell-embed-reset-ack' as const;
export const SHELL_EMBED_NAVIGATE_MESSAGE =
  'nebula-shell-embed-navigate' as const;
export const SHELL_EMBED_PAGE_META_MESSAGE =
  'nebula-shell-embed-page-meta' as const;

export type ShellEmbedResetPayload = {
  type: typeof SHELL_EMBED_RESET_MESSAGE;
};

export type ShellEmbedResetAckPayload = {
  type: typeof SHELL_EMBED_RESET_ACK_MESSAGE;
};

export type ShellEmbedNavigatePayload = {
  type: typeof SHELL_EMBED_NAVIGATE_MESSAGE;
  path: string;
};

export type ShellEmbedPageMetaPayload = {
  type: typeof SHELL_EMBED_PAGE_META_MESSAGE;
  appId: string;
  path: string;
  title?: string;
  helpKey?: string;
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

export function isShellEmbedNavigatePayload(
  data: unknown,
): data is ShellEmbedNavigatePayload {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as ShellEmbedNavigatePayload).type === SHELL_EMBED_NAVIGATE_MESSAGE &&
    typeof (data as ShellEmbedNavigatePayload).path === 'string' &&
    (data as ShellEmbedNavigatePayload).path.startsWith('/')
  );
}

export function isShellEmbedPageMetaPayload(
  data: unknown,
): data is ShellEmbedPageMetaPayload {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as ShellEmbedPageMetaPayload).type ===
      SHELL_EMBED_PAGE_META_MESSAGE &&
    typeof (data as ShellEmbedPageMetaPayload).appId === 'string' &&
    typeof (data as ShellEmbedPageMetaPayload).path === 'string'
  );
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

/** 子应用 iframe 内：接收宿主的站内导航指令。 */
export function installShellEmbedNavigationListener(
  onNavigate: (path: string) => void,
): () => void {
  const handler = (event: MessageEvent) => {
    if (event.source !== window.parent) return;
    if (event.origin !== window.location.origin) return;
    if (!isShellEmbedNavigatePayload(event.data)) return;
    onNavigate(event.data.path);
  };
  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}

/** 宿主壳：导航已挂载的子应用，不重载 iframe。 */
export function postShellEmbedNavigate(
  contentWindow: Window | null | undefined,
  path: string,
  targetOrigin: string = window.location.origin,
): void {
  if (!path.startsWith('/')) return;
  const payload: ShellEmbedNavigatePayload = {
    type: SHELL_EMBED_NAVIGATE_MESSAGE,
    path,
  };
  contentWindow?.postMessage(payload, targetOrigin);
}

/** 子应用 iframe 内：向宿主同步当前页面标题和帮助键。 */
export function postShellEmbedPageMeta(
  payload: Omit<ShellEmbedPageMetaPayload, 'type'>,
  targetOrigin: string = window.location.origin,
): void {
  if (window.parent === window) return;
  window.parent.postMessage(
    { type: SHELL_EMBED_PAGE_META_MESSAGE, ...payload },
    targetOrigin,
  );
}
