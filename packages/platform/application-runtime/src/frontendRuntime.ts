import type { GeneratedFrontendRuntimeEntryView } from '@nebula-studio/contracts/generated';
import type { FrontendRuntimeEntry } from '@nebula-studio/contracts/system';

import { GENERATED_FEDERATION_DEV_ENTRIES } from '@nebula-studio/contracts/generated';
import { mapFrontendRuntimeEntryFromGenerated } from '@nebula-studio/contracts/system';

import { alignLoopbackIframeSrc, isIframeSrcAllowed } from './hostCsp.ts';
import {
  hostDevMfEntryUrl,
  shouldRewriteLoopbackManifestToHostGateway,
} from './hostDevMf.ts';
import { packagedRemoteUpdatePolicy } from './packagedRemoteUpdate.ts';

export interface StaticRemoteRegistration {
  entry: string;
  expose: string;
  integrity?: string;
  name: string;
  signature?: string;
  version?: string;
}

export function resolveRemoteManifestEntry(options: {
  httpEntry: string;
  packagedHost: string;
}): string {
  if (typeof location === 'undefined') {
    return options.httpEntry;
  }
  switch (location.protocol) {
    case 'file:':
    case 'nebula-remote:':
      return `nebula-remote://${options.packagedHost}/mf-manifest.json`;
    case 'mf-poc:':
      return `mf-poc://${options.packagedHost}/mf-manifest.json`;
    default:
      if (
        shouldRewriteLoopbackManifestToHostGateway(
          options.httpEntry,
          location.origin,
        )
      ) {
        return hostDevMfEntryUrl(
          options.packagedHost,
          options.httpEntry,
          location.origin,
        );
      }
      return options.httpEntry;
  }
}

export function withHostResolvedManifestEntry(
  registration: StaticRemoteRegistration,
  packagedHost: string,
): StaticRemoteRegistration {
  return {
    ...registration,
    entry: resolveRemoteManifestEntry({
      httpEntry: registration.entry,
      packagedHost,
    }),
  };
}

export const FRONTEND_RUNTIME_PATH = '/api/system/frontend-apps/runtime';

export const LOCAL_FEDERATION_FALLBACKS = GENERATED_FEDERATION_DEV_ENTRIES;

export type LocalFederationFallbackId = keyof typeof LOCAL_FEDERATION_FALLBACKS;

/** @deprecated Use LOCAL_FEDERATION_FALLBACKS.docs */
export const LOCAL_DOCS_FEDERATION_FALLBACK = LOCAL_FEDERATION_FALLBACKS.docs;

export function isLocalFederationFallbackId(
  applicationId: string,
): applicationId is LocalFederationFallbackId {
  return applicationId in LOCAL_FEDERATION_FALLBACKS;
}

export function normalizeExposedModule(exposedModule?: string): string {
  const value = exposedModule?.trim() || './application';
  return value.replace(/^\.\//, '');
}

export function findFederationRuntimeEntry(
  entries: readonly FrontendRuntimeEntry[],
  applicationId: string,
): FrontendRuntimeEntry | undefined {
  return entries.find(
    (entry) => entry.id === applicationId && entry.driver === 'federation',
  );
}

export function federationRegistrationFromRuntime(
  entry: FrontendRuntimeEntry,
  options?: { httpEntryOverride?: string },
): StaticRemoteRegistration {
  const remoteName = entry.remoteName?.trim();
  const override = packagedRemoteUpdatePolicy().pinToExtraResources
    ? undefined
    : options?.httpEntryOverride?.trim();
  const manifestUrl = override || entry.manifestUrl?.trim();
  if (!remoteName || !manifestUrl) {
    throw new Error(
      `frontend runtime entry "${entry.id}" is missing remoteName or manifestUrl`,
    );
  }
  const registration: StaticRemoteRegistration = {
    name: remoteName,
    expose: normalizeExposedModule(entry.exposedModule),
    entry: resolveRemoteManifestEntry({
      httpEntry: manifestUrl,
      packagedHost: entry.id,
    }),
  };
  const integrity = override ? undefined : entry.integrity?.trim();
  if (integrity) {
    registration.integrity = integrity;
  }
  const signature = override ? undefined : entry.signature?.trim();
  if (signature) {
    registration.signature = signature;
  }
  if (entry.version) {
    registration.version = entry.version;
  }
  return registration;
}

export function localFederationRegistration(
  applicationId: LocalFederationFallbackId,
  httpEntryOverride?: string,
): StaticRemoteRegistration {
  const fallback = LOCAL_FEDERATION_FALLBACKS[applicationId];
  return {
    name: fallback.name,
    expose: fallback.expose,
    entry: resolveRemoteManifestEntry({
      httpEntry: httpEntryOverride?.trim() || fallback.defaultHttpEntry,
      packagedHost: fallback.packagedHost,
    }),
  };
}

export function localDocsFederationRegistration(
  httpEntryOverride?: string,
): StaticRemoteRegistration {
  return localFederationRegistration('docs', httpEntryOverride);
}

export function findRuntimeDriverEntry(
  entries: readonly FrontendRuntimeEntry[],
  applicationId: string,
  driver: FrontendRuntimeEntry['driver'],
): FrontendRuntimeEntry | undefined {
  return entries.find(
    (entry) => entry.id === applicationId && entry.driver === driver,
  );
}

export function runtimeEmbedUrl(entry: FrontendRuntimeEntry): string {
  const value = entry.manifestUrl?.trim() || entry.defaultPath?.trim() || '';
  if (!value) {
    throw new Error(
      `frontend runtime entry "${entry.id}" is missing embed url`,
    );
  }
  return value;
}

export function resolveIframeSrc(
  entry: FrontendRuntimeEntry,
  origin = typeof location === 'undefined' ? '' : location.origin,
): string {
  const url = runtimeEmbedUrl(entry);
  const resolved =
    url.startsWith('/') && !url.startsWith('//') ? `${origin}${url}` : url;
  return origin ? alignLoopbackIframeSrc(resolved, origin) : resolved;
}

export function resolveExternalHref(entry: FrontendRuntimeEntry): string {
  const url = runtimeEmbedUrl(entry);
  if (url.startsWith('/') && !url.startsWith('//')) {
    throw new Error(
      `external runtime entry "${entry.id}" requires an absolute url`,
    );
  }
  return url;
}

export function isIframeRuntimeEntry(entry: FrontendRuntimeEntry): boolean {
  return entry.driver === 'iframe';
}

export function isExternalRuntimeEntry(entry: FrontendRuntimeEntry): boolean {
  return entry.driver === 'external';
}

export function iframeRegistrationFromRuntime(
  entry: FrontendRuntimeEntry,
  origin?: string,
): { allowedOrigin: string; src: string } {
  if (!isIframeRuntimeEntry(entry)) {
    throw new Error(
      `frontend runtime entry "${entry.id}" is not an iframe driver`,
    );
  }
  const src = resolveIframeSrc(entry, origin);
  const pageOrigin =
    origin ??
    (typeof location === 'undefined' ? new URL(src).origin : location.origin);
  if (!isIframeSrcAllowed(src, entry.allowedOrigins, pageOrigin)) {
    throw new Error(
      `iframe runtime entry "${entry.id}" origin is not in allowedOrigins`,
    );
  }
  return {
    src,
    allowedOrigin: new URL(src).origin,
  };
}

export async function fetchFrontendRuntimeEntries(init?: {
  tenantId?: null | string;
  token?: null | string;
}): Promise<FrontendRuntimeEntry[]> {
  const headers = new Headers();
  const token = init?.token?.trim();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const tenantId = init?.tenantId?.trim();
  if (tenantId) {
    headers.set('X-Tenant-Id', tenantId);
  }
  const response = await fetch(FRONTEND_RUNTIME_PATH, { headers });
  if (!response.ok) {
    throw new Error(`frontend runtime HTTP ${String(response.status)}`);
  }
  const body = (await response.json()) as {
    code?: number;
    data?: unknown;
    success?: boolean;
  };
  if (
    body.success === false ||
    (body.code !== undefined && body.code !== 200)
  ) {
    throw new Error('frontend runtime response was not successful');
  }
  if (!Array.isArray(body.data)) {
    throw new Error('frontend runtime payload is not an array');
  }
  return body.data.map((row) =>
    mapFrontendRuntimeEntryFromGenerated(
      row as GeneratedFrontendRuntimeEntryView,
    ),
  );
}
