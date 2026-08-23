import type { HostCapabilities } from '@nebula-studio/application-contract';
import type {
  ComponentCatalogReader,
  DraftDocumentPort,
  StudioLifecyclePort,
} from '@nebula-studio/editors-low-code';
import type {
  ExactComponentLock,
  LowCodeDraftDocument,
} from '@nebula-studio/low-code-contract';

import {
  createMemoryDraftPort,
  DEFAULT_LOW_CODE_CATALOG,
} from '@nebula-studio/editors-low-code';
import { TRUSTED_COMPONENT_LOCK } from '@nebula-studio/low-code-kit';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrap(payload: unknown): unknown {
  if (isRecord(payload) && payload.data !== undefined) {
    return payload.data;
  }
  return payload;
}

function failIfEnvelope(payload: unknown): unknown {
  if (!isRecord(payload)) {
    return payload;
  }
  const code = payload.code;
  const failed =
    payload.success === false || (typeof code === 'number' && code !== 200);
  if (failed) {
    const message =
      typeof payload.error === 'string'
        ? payload.error
        : `low-code API ${String(code ?? 'unknown')}`;
    throw new Error(message);
  }
  return unwrap(payload);
}

async function studioFetch(
  path: string,
  init: RequestInit,
  capabilities: HostCapabilities,
): Promise<unknown> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  const token =
    capabilities.api?.createClient().getToken() ??
    capabilities.auth?.getToken?.() ??
    null;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const response = await fetch(path, {
    ...init,
    headers,
    credentials: 'include',
  });
  const payload: unknown = await response.json();
  if (!response.ok) {
    const body = isRecord(payload) ? payload.error : undefined;
    throw new Error(
      typeof body === 'string' ? body : `HTTP ${String(response.status)}`,
    );
  }
  return failIfEnvelope(payload);
}

export async function loadStudioDraft(
  applicationId: string,
  fallback: LowCodeDraftDocument,
  capabilities: HostCapabilities,
): Promise<LowCodeDraftDocument> {
  try {
    const data = await studioFetch(
      `/api/low-code/studio/${encodeURIComponent(applicationId)}/draft`,
      { method: 'GET' },
      capabilities,
    );
    if (!isRecord(data) || !isRecord(data.definition)) {
      return fallback;
    }
    return {
      ...(data.definition as unknown as LowCodeDraftDocument),
      draftId:
        typeof data.draftId === 'string' ? data.draftId : fallback.draftId,
    };
  } catch {
    return fallback;
  }
}

export function createHttpDraftPort(
  applicationId: string,
  initial: LowCodeDraftDocument,
  capabilities: HostCapabilities,
  componentLock: ExactComponentLock,
): DraftDocumentPort {
  const memory = createMemoryDraftPort(initial);
  return {
    load: () => memory.load(),
    save(document) {
      memory.save(document);
      void studioFetch(
        `/api/low-code/write/studio/${encodeURIComponent(applicationId)}/draft`,
        {
          method: 'PUT',
          body: JSON.stringify({
            draftId: document.draftId,
            definition: document,
            componentLock,
          }),
        },
        capabilities,
      );
    },
  };
}

export function createStudioLifecycle(
  applicationId: string,
  capabilities: HostCapabilities,
): StudioLifecyclePort {
  return {
    async preview(document, componentLock) {
      await studioFetch(
        `/api/low-code/write/studio/${encodeURIComponent(applicationId)}/preview`,
        {
          method: 'POST',
          body: JSON.stringify({ definition: document, componentLock }),
        },
        capabilities,
      );
    },
    async publish(document, componentLock, version) {
      await studioFetch(
        `/api/low-code/write/studio/${encodeURIComponent(applicationId)}/publish`,
        {
          method: 'POST',
          body: JSON.stringify({
            version,
            definition: document,
            componentLock,
            lowCodeStudioVersion: '0.0.0',
            runtimeExpose: './runtime-application',
            compilerVersionRange: '^1.0.0',
          }),
        },
        capabilities,
      );
    },
    async rollback(version) {
      await studioFetch(
        `/api/low-code/write/studio/${encodeURIComponent(applicationId)}/rollback`,
        {
          method: 'POST',
          body: JSON.stringify({ version }),
        },
        capabilities,
      );
    },
  };
}

export async function loadStudioCatalog(
  capabilities: HostCapabilities,
): Promise<ComponentCatalogReader> {
  try {
    const data = await studioFetch(
      '/api/low-code/catalog?status=PUBLISHED',
      { method: 'GET' },
      capabilities,
    );
    if (!Array.isArray(data) || data.length === 0) {
      return DEFAULT_LOW_CODE_CATALOG;
    }
    const extra = data.flatMap((item) => {
      if (!isRecord(item)) {
        return [];
      }
      const compatibility = isRecord(item.compatibility)
        ? item.compatibility
        : {};
      const type =
        typeof compatibility.componentType === 'string'
          ? compatibility.componentType
          : null;
      if (!type) {
        return [];
      }
      return [
        {
          type,
          label: typeof item.packageName === 'string' ? item.packageName : type,
          group: 'business' as const,
        },
      ];
    });
    const seen = new Set(
      DEFAULT_LOW_CODE_CATALOG.types.map((item) => item.type),
    );
    return {
      types: [
        ...DEFAULT_LOW_CODE_CATALOG.types,
        ...extra.filter((item) => !seen.has(item.type)),
      ],
    };
  } catch {
    return DEFAULT_LOW_CODE_CATALOG;
  }
}

export { TRUSTED_COMPONENT_LOCK };

export interface LowCodePublishedTicket {
  applicationId: string;
  rolloutPercent: number;
  status: string;
  version: string;
}

export async function listStudioVersions(
  applicationId: string,
  capabilities: HostCapabilities,
): Promise<LowCodePublishedTicket[]> {
  const data = await studioFetch(
    `/api/low-code/studio/${encodeURIComponent(applicationId)}/versions`,
    { method: 'GET' },
    capabilities,
  );
  if (!Array.isArray(data)) {
    return [];
  }
  return data.flatMap((item) => {
    if (!isRecord(item) || typeof item.version !== 'string') {
      return [];
    }
    return [
      {
        applicationId:
          typeof item.applicationId === 'string'
            ? item.applicationId
            : applicationId,
        version: item.version,
        status: typeof item.status === 'string' ? item.status : '',
        rolloutPercent:
          typeof item.rolloutPercent === 'number' ? item.rolloutPercent : 100,
      },
    ];
  });
}

export async function approveStudioVersion(
  applicationId: string,
  version: string,
  capabilities: HostCapabilities,
): Promise<void> {
  await studioFetch(
    `/api/low-code/write/studio/${encodeURIComponent(applicationId)}/approve`,
    {
      method: 'POST',
      body: JSON.stringify({ version }),
    },
    capabilities,
  );
}
