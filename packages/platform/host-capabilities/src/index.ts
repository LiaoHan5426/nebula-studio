import type {
  HostApiCapability,
  HostAuthSession,
  HostCapabilities,
  HostCapabilityEvent,
} from '@nebula-studio/application-contract';

import { CONTRACT_VERSION } from '@nebula-studio/application-contract';
import {
  clearWebAuthSession,
  readWebAuthSession,
} from '@nebula-studio/auth-provider/storage';

import { createHostLocaleCapability } from './localeHost';
import { createHostThemeCapability } from './themeHost';

interface ShellEventBusLike {
  emit?(event: string, payload: unknown): void;
  on?(event: string, handler: (payload: unknown) => void): () => void;
}

interface AuthBridge {
  logout?(): Promise<unknown> | unknown;
}

function readTenantId(): null | string {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem('tenant_id');
}

function readAuthSession(): HostAuthSession | null {
  const payload = readWebAuthSession();
  if (!payload?.user || !payload.token) {
    return null;
  }
  return {
    username: payload.user,
    token: payload.token,
    roles: payload.roles,
    userId: payload.userId,
    tenantId: readTenantId() ?? undefined,
  };
}

function readAuthToken(): null | string {
  return readAuthSession()?.token?.trim() || null;
}

function hostApiClient(): ReturnType<HostApiCapability['createClient']> {
  return {
    getToken: readAuthToken,
    getTenantId: readTenantId,
  };
}

function resolveShellEventBusLike(): ShellEventBusLike | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const read = (target: Window): ShellEventBusLike | undefined =>
    (target as Window & { __NEBULA_SHELL_EVENT_BUS__?: ShellEventBusLike })
      .__NEBULA_SHELL_EVENT_BUS__;
  try {
    if (window.parent !== window) {
      const parentBus = read(window.parent);
      if (parentBus) {
        return parentBus;
      }
    }
  } catch {
    // cross-origin iframe
  }
  return read(window);
}

function subscribeHostEvent(
  event: HostCapabilityEvent,
  handler: (payload?: string) => void,
): () => void {
  const bus = resolveShellEventBusLike();
  if (!bus?.on) {
    return () => undefined;
  }
  if (event === 'auth-logout') {
    return bus.on('auth:logout', (payload) => {
      const reason =
        payload && typeof payload === 'object' && 'reason' in payload
          ? String((payload as { reason?: string }).reason ?? '')
          : undefined;
      handler(reason || undefined);
    });
  }
  return bus.on('tenant:changed', (payload) => {
    const tenantId =
      payload && typeof payload === 'object' && 'tenantId' in payload
        ? String((payload as { tenantId?: string }).tenantId ?? '')
        : undefined;
    handler(tenantId || undefined);
  });
}

async function invokeAuthLogout(target: Window): Promise<void> {
  const api = (target as Window & { api?: { auth?: AuthBridge } }).api?.auth;
  await api?.logout?.();
}

async function hostLogout(): Promise<void> {
  clearWebAuthSession();
  if (typeof window === 'undefined') {
    return;
  }
  try {
    await invokeAuthLogout(window);
  } catch {
    /* ignore */
  }
  try {
    if (window.parent !== window) {
      await invokeAuthLogout(window.parent);
    }
  } catch {
    /* ignore */
  }
  resolveShellEventBusLike()?.emit?.('auth:logout', {});
}

export function createPocHostCapabilities(): HostCapabilities {
  return {
    contractVersion: CONTRACT_VERSION,
    auth: {
      getSession: () => null,
      getToken: () => null,
      logout: () => undefined,
    },
    api: {
      createClient: hostApiClient,
    },
    tenant: {
      getTenantId: () => null,
    },
    events: {
      subscribe: subscribeHostEvent,
    },
    navigation: {
      openExternal(url: string) {
        window.open(url, '_blank', 'noopener,noreferrer');
      },
    },
    theme: createHostThemeCapability(),
    locale: createHostLocaleCapability(),
  };
}

export function createWebEmbedHostCapabilities(): HostCapabilities {
  return {
    ...createPocHostCapabilities(),
    auth: {
      getSession: readAuthSession,
      getToken: readAuthToken,
      logout: hostLogout,
    },
    api: {
      createClient: hostApiClient,
    },
    tenant: {
      getTenantId: readTenantId,
    },
    events: {
      subscribe: subscribeHostEvent,
    },
  };
}

export {
  assertIframeMethodPayload,
  connectIframeCapabilityBridge,
  createIframeCapabilityHost,
  createIframeHandshakeMessage,
  IFRAME_CAPABILITY_MIN_PROTOCOL_VERSION,
  IFRAME_CAPABILITY_PROTOCOL,
  IFRAME_CAPABILITY_PROTOCOL_VERSION,
  IFRAME_HANDSHAKE_ACK_TYPE,
  IFRAME_HANDSHAKE_TYPE,
  IFRAME_REQUEST_TIMEOUT_MS,
  installIframeCapabilityGuest,
  isCloneablePayload,
  isIframeHandshakeAckMessage,
  isIframeHandshakeMessage,
  negotiateIframeProtocolVersion,
} from './iframeBridge';
export type {
  IframeCapabilityBridge,
  IframeHandshakeAckMessage,
  IframeHandshakeMessage,
} from './iframeBridge.ts';

export const pocHostCapabilities: HostCapabilities =
  createPocHostCapabilities();

export { createHostLocaleCapability } from './localeHost';
export { createHostThemeCapability } from './themeHost';
