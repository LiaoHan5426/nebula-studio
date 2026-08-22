import type { StaticRemoteRegistration } from '@nebula-studio/application-runtime';

import {
  createFrontendTelemetryReporter,
  fetchFrontendRuntimeEntries,
  isLocalFederationFallbackId,
  localFederationRegistration,
  mountFederationRemote,
  mountWithLastKnownGood,
  packagedRemoteUpdatePolicy,
  readLastKnownGood,
  registerStaticRemotes,
  resolveFederationRegistrationWithPolicy,
} from '@nebula-studio/application-runtime';
import { readParentShellAuthSession } from '@nebula-studio/auth-provider/web';
import { createWebEmbedHostCapabilities } from '@nebula-studio/host-capabilities';
import { WEB_SHELL_EMBED_QUERY } from '@nebula-studio/shell-protocol';

document.documentElement.dataset.platform = 'web';

function hostRuntimeAuth(): { tenantId: string; token?: string } {
  const session = readParentShellAuthSession();
  const tenantId =
    (typeof localStorage === 'undefined'
      ? null
      : localStorage.getItem('tenant_id')) ?? 'tenant-a';
  return { token: session?.token, tenantId };
}

function remoteHttpEntryOverride(surface: string): string | undefined {
  if (surface === 'docs') {
    return import.meta.env.VITE_NEBULA_DOCS_REMOTE as string | undefined;
  }
  if (surface === 'settings') {
    return import.meta.env.VITE_NEBULA_SETTINGS_REMOTE as string | undefined;
  }
  if (surface === 'integration') {
    return import.meta.env.VITE_NEBULA_INTEGRATION_REMOTE as string | undefined;
  }
  return undefined;
}

function rolloutSeed(): string {
  const tenantId =
    (typeof localStorage === 'undefined'
      ? null
      : localStorage.getItem('tenant_id')) ?? 'tenant-a';
  const session = readParentShellAuthSession();
  return `${tenantId}:${session?.userId ?? session?.user ?? 'anonymous'}`;
}

async function resolveFederationRegistration(
  surface: string,
): Promise<null | StaticRemoteRegistration> {
  const httpEntryOverride = remoteHttpEntryOverride(surface);
  try {
    const entries = await fetchFrontendRuntimeEntries(hostRuntimeAuth());
    return resolveFederationRegistrationWithPolicy({
      applicationId: surface,
      entries,
      httpEntryOverride,
      rolloutSeed: rolloutSeed(),
    });
  } catch (error) {
    console.warn(
      '[web-boot] frontend runtime unavailable, using last-known-good or local fallback',
      error,
    );
    const lkg = readLastKnownGood(surface);
    if (lkg) return lkg;
    if (!isLocalFederationFallbackId(surface)) {
      return null;
    }
    return localFederationRegistration(surface, httpEntryOverride);
  }
}

function showRemoteLoadError(
  container: HTMLElement,
  surface: string,
  error: unknown,
): void {
  const text = error instanceof Error ? error.message : String(error);
  const hints: Record<string, { command: string; label: string }> = {
    docs: {
      command: 'vp run --filter @nebula-studio-renderer/docs dev',
      label: '文档',
    },
    settings: {
      command: 'vp run --filter @nebula-studio-renderer/settings dev',
      label: '设置',
    },
    integration: {
      command: 'vp run --filter @nebula-studio-renderer/integration dev',
      label: '集成平台',
    },
  };
  const hint = hints[surface] ?? hints.docs;
  const command = hint.command;
  const label = hint.label;
  container.innerHTML = `<div role="alert" style="padding:1.5rem;font:14px/1.5 system-ui,sans-serif">无法加载${label}应用。<pre>${text}</pre><p>请先启动 Remote：<code>${command}</code></p></div>`;
}

async function bootFederationSurface(
  surface: string,
  remote: StaticRemoteRegistration,
): Promise<void> {
  const root = document.querySelector('#app');
  if (!(root instanceof HTMLElement)) {
    throw new Error('[web-boot] missing #app');
  }
  const report = createFrontendTelemetryReporter(hostRuntimeAuth());
  if (packagedRemoteUpdatePolicy().pinToExtraResources) {
    report({
      applicationId: surface,
      entry: remote.entry,
      eventType: 'packaged_pin',
      version: remote.version,
    });
  }
  try {
    await mountWithLastKnownGood({
      applicationId: surface,
      live: remote,
      report,
      mount: async (registration) => {
        registerStaticRemotes([registration]);
        return mountFederationRemote({
          name: registration.name,
          expose: registration.expose,
          container: root,
          capabilities: createWebEmbedHostCapabilities(),
          application: {
            id: surface,
            version: registration.version ?? '0.0.0',
          },
          initialPath: `${location.pathname}${location.search}${location.hash}`,
        });
      },
    });
  } catch (error) {
    showRemoteLoadError(root, surface, error);
    console.error(error);
  }
}

void (async (): Promise<void> => {
  const surface = new URLSearchParams(location.search).get(
    WEB_SHELL_EMBED_QUERY,
  );

  if (surface === 'login') {
    const { bootHostLogin } = await import('./auth/bootHostLogin.js');
    await bootHostLogin('platform-embed');
    return;
  }

  if (surface) {
    const remote = await resolveFederationRegistration(surface);
    if (remote) {
      await bootFederationSurface(surface, remote);
      return;
    }
  }

  await import('./shell-entry.js');
})();
