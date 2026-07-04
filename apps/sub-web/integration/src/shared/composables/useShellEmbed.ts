/**
 * Shell embed detection for integration sub-web.
 *
 * Delegates to `@nebula-studio/app-shell` which provides the generic
 * `isSurfaceEmbed` / `isSurfaceIframeEmbed` / `readParentShellAuthSession`
 * helpers.  This file keeps thin wrappers for backward compatibility.
 */
import {
  isSurfaceEmbed,
  isSurfaceIframeEmbed,
  readParentShellAuthSession as _readParent,
} from '@nebula-studio/app-shell';
import type { ShellAuthSessionPayload } from '@nebula-studio/app-shell';

export function isIntegrationShellEmbed(): boolean {
  return isSurfaceEmbed('integration');
}

/** 仅在 Web 壳 iframe 内嵌时跳过独立登录守卫 */
export function isIntegrationShellIframeEmbed(): boolean {
  return isSurfaceIframeEmbed('integration');
}

/** 从 Web 壳父窗口读取登录会话（iframe 与父页 sessionStorage 隔离） */
export function readParentShellAuthSession(): ShellAuthSessionPayload | null {
  return _readParent();
}
