import {
  SHELL_AUTH_SESSION_KEY,
  getWebShellEmbedSurface,
} from '@nebula-studio/app-shell';
import type { ShellAuthSessionPayload } from '@nebula-studio/app-shell';

export function isIntegrationShellEmbed(): boolean {
  return getWebShellEmbedSurface() === 'integration';
}

/** 从 Web 壳父窗口读取登录会话（iframe 与父页 sessionStorage 隔离） */
export function readParentShellAuthSession(): ShellAuthSessionPayload | null {
  try {
    const storage =
      window.parent !== window ? window.parent.sessionStorage : sessionStorage;
    const raw = storage.getItem(SHELL_AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShellAuthSessionPayload;
  } catch {
    return null;
  }
}
