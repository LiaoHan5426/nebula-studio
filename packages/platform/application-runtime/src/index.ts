import type {
  HostCapabilities,
  NebulaRemoteApplication,
  RemoteHandle,
} from '@nebula-studio/application-contract';

import type { StaticRemoteRegistration } from './frontendRuntime.ts';

import { CONTRACT_VERSION } from '@nebula-studio/application-contract';

import { createInstance } from '@module-federation/runtime';

import { FEDERATION_LOAD_TIMEOUT_MS, withTimeout } from './remoteResilience.ts';

export type { StaticRemoteRegistration } from './frontendRuntime.ts';
export {
  federationRegistrationFromRuntime,
  fetchFrontendRuntimeEntries,
  findFederationRuntimeEntry,
  findRuntimeDriverEntry,
  FRONTEND_RUNTIME_PATH,
  iframeRegistrationFromRuntime,
  isExternalRuntimeEntry,
  isIframeRuntimeEntry,
  isLocalFederationFallbackId,
  LOCAL_DOCS_FEDERATION_FALLBACK,
  LOCAL_FEDERATION_FALLBACKS,
  localDocsFederationRegistration,
  localFederationRegistration,
  normalizeExposedModule,
  packagedHostForRuntimeEntry,
  resolveExternalHref,
  resolveIframeSrc,
  resolveRemoteManifestEntry,
  runtimeEmbedUrl,
  withHostResolvedManifestEntry,
} from './frontendRuntime.ts';
/** @deprecated Use LOCAL_DOCS_FEDERATION_FALLBACK; Host loads remotes from /api/system/frontend-apps/runtime */
export { LOCAL_DOCS_FEDERATION_FALLBACK as DOCS_FEDERATION_REMOTE } from './frontendRuntime.ts';
export {
  HOST_DEV_MF_GATEWAY_PREFIX,
  HOST_MF_GATEWAY_PREFIX,
  hostDevMfEntryUrl,
  hostDevMfManifestUrl,
  hostOwnedMfEntryUrl,
  isHostOwnedManifestEntry,
  isLoopbackHttpOrigin,
  shouldRewriteLoopbackManifestToHostGateway,
} from './hostDevMf.ts';
export {
  assertHttpManifestIntegrity,
  digestSri,
  isHttpManifestUrl,
  matchesSri,
  parseSri,
} from './manifestIntegrity.ts';
export {
  parseManifestSignature,
  signManifestBytes,
  verifyManifestSignature,
} from './manifestSignature.ts';
export type { ManifestSignatureAlgorithm } from './manifestSignature.ts';
export {
  currentLocationProtocol,
  packagedRemoteUpdatePolicy,
} from './packagedRemoteUpdate.ts';
export type { PackagedRemoteUpdatePolicy } from './packagedRemoteUpdate.ts';
export {
  browserKvStore,
  createMemoryKv,
  FEDERATION_LOAD_TIMEOUT_MS,
  isCircuitOpen,
  isInRolloutCohort,
  mountWithLastKnownGood,
  readLastKnownGood,
  recordRemoteFailure,
  recordRemoteSuccess,
  resolveFederationRegistrationWithPolicy,
  withTimeout,
  writeLastKnownGood,
} from './remoteResilience.ts';

export function asNebulaRemoteApplication(
  module: unknown,
): NebulaRemoteApplication {
  if (!module || typeof module !== 'object') {
    throw new Error('invalid NebulaRemoteApplication');
  }
  const value = module as NebulaRemoteApplication & {
    default?: NebulaRemoteApplication;
  };
  const remote = value.default ?? value;
  if (
    !remote ||
    typeof remote !== 'object' ||
    remote.contractVersion !== CONTRACT_VERSION ||
    typeof remote.mount !== 'function'
  ) {
    throw new Error('invalid NebulaRemoteApplication');
  }
  return remote;
}

const federationHost = createInstance({
  name: 'nebula_host',
  remotes: [],
});

export function registerStaticRemotes(
  registry: readonly Pick<StaticRemoteRegistration, 'entry' | 'name'>[],
): void {
  federationHost.registerRemotes(
    registry.map((item) => ({
      name: item.name,
      entry: item.entry,
      type: 'module',
    })),
  );
}

const mountedCssNamespaces = new Set<string>();

export function resetMountedCssNamespacesForTests(): void {
  mountedCssNamespaces.clear();
}

export function resolveRemoteCssNamespace(options: {
  application?: { id: string };
  name: string;
}): string {
  return options.application?.id ?? options.name;
}

export function claimCssNamespace(cssNamespace: string): void {
  if (mountedCssNamespaces.has(cssNamespace)) {
    throw new Error(`duplicate cssNamespace: ${cssNamespace}`);
  }
  mountedCssNamespaces.add(cssNamespace);
}

export function releaseCssNamespace(cssNamespace: string): void {
  mountedCssNamespaces.delete(cssNamespace);
}

export async function mountFederationRemote(options: {
  application?: { id: string; runtimeConfig?: unknown; version: string };
  capabilities: HostCapabilities;
  container: HTMLElement;
  expose: string;
  initialPath?: string;
  name: string;
  timeoutMs?: number;
}): Promise<RemoteHandle> {
  const cssNamespace = resolveRemoteCssNamespace(options);
  claimCssNamespace(cssNamespace);
  try {
    const module = await withTimeout(
      federationHost.loadRemote(`${options.name}/${options.expose}`),
      options.timeoutMs ?? FEDERATION_LOAD_TIMEOUT_MS,
      `federation load timed out after ${String(options.timeoutMs ?? FEDERATION_LOAD_TIMEOUT_MS)}ms`,
    );
    const remote = asNebulaRemoteApplication(module);
    const handle = await remote.mount({
      container: options.container,
      initialPath: options.initialPath ?? '/',
      application: options.application ?? {
        id: options.name,
        version: '0.0.0',
      },
      capabilities: options.capabilities,
    });
    return {
      navigate: handle.navigate.bind(handle),
      async unmount() {
        releaseCssNamespace(cssNamespace);
        await handle.unmount();
      },
    };
  } catch (error) {
    releaseCssNamespace(cssNamespace);
    throw error;
  }
}

export async function runRemoteContractHarness(
  remote: NebulaRemoteApplication,
  capabilities: HostCapabilities,
): Promise<void> {
  if (remote.contractVersion !== CONTRACT_VERSION) {
    throw new Error('contractVersion mismatch');
  }
  const container = document.createElement('div');
  document.body.append(container);
  const handle = await remote.mount({
    container,
    initialPath: '/',
    application: { id: 'harness', version: '0.0.0' },
    capabilities,
  });
  await handle.unmount();
  container.remove();
}

export { CONTRACT_VERSION };

export type { KvStore } from './remoteResilience.ts';
export {
  createFrontendTelemetryReporter,
  FRONTEND_TELEMETRY_PATH,
  REMOTE_TELEMETRY_EVENT_TYPES,
  reportRemoteTelemetry,
} from './remoteTelemetry.ts';

export type {
  RemoteTelemetryEvent,
  RemoteTelemetryEventType,
  RemoteTelemetryReporter,
} from './remoteTelemetry.ts';
