import type { ShellAuthSessionPayload } from '@nebula-studio/auth-provider/storage';

import { readParentShellAuthSession as _readParent } from '@nebula-studio/auth-provider/web';
import {
  isSurfaceEmbed,
  isSurfaceIframeEmbed,
} from '@nebula-studio/shell-protocol';

export function isIntegrationShellEmbed(): boolean {
  return isSurfaceEmbed('integration');
}

/** 仅在 Web 壳 iframe 内嵌时跳过独立登录守卫 */
export function isIntegrationShellIframeEmbed(): boolean {
  return isSurfaceIframeEmbed('integration');
}

/** 从 Web 壳父窗口读取登录会话（iframe 与父页 sessionStorage 隔离） */
export function readParentShellAuthSession(): null | ShellAuthSessionPayload {
  return _readParent();
}
