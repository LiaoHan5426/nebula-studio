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
import { readWebAuthSession } from '@nebula-studio/auth-provider/storage';
import { createWebEmbedHostCapabilities } from '@nebula-studio/host-capabilities';

function hostRuntimeAuth(): { tenantId: string; token?: string } {
  const session = readWebAuthSession();
  const tenantId =
    (typeof localStorage === 'undefined'
      ? null
      : localStorage.getItem('tenant_id')) ?? 'tenant-a';
  return { token: session?.token, tenantId };
}

function remoteHttpEntryOverride(renderer: string): string | undefined {
  if (renderer === 'docs') {
    return import.meta.env.VITE_NEBULA_DOCS_REMOTE as string | undefined;
  }
  if (renderer === 'settings') {
    return import.meta.env.VITE_NEBULA_SETTINGS_REMOTE as string | undefined;
  }
  if (renderer === 'integration') {
    return import.meta.env.VITE_NEBULA_INTEGRATION_REMOTE as string | undefined;
  }
  return undefined;
}

export async function bootFederationRenderer(renderer: string): Promise<void> {
  const root = document.querySelector('#app');
  if (!(root instanceof HTMLElement)) {
    throw new Error('[electron-boot] missing #app');
  }
  const httpEntryOverride = remoteHttpEntryOverride(renderer);
  const tenantId =
    (typeof localStorage === 'undefined'
      ? null
      : localStorage.getItem('tenant_id')) ?? 'tenant-a';
  const session = readWebAuthSession();
  const rolloutSeed = `${tenantId}:${session?.userId ?? session?.user ?? 'anonymous'}`;
  let remote;
  try {
    const entries = await fetchFrontendRuntimeEntries(hostRuntimeAuth());
    remote = resolveFederationRegistrationWithPolicy({
      applicationId: renderer,
      entries,
      httpEntryOverride,
      rolloutSeed,
    });
    if (!remote) {
      throw new Error(
        `[electron-boot] no federation runtime entry for "${renderer}"`,
      );
    }
  } catch (error) {
    console.warn(
      '[electron-boot] frontend runtime unavailable, using last-known-good or local fallback',
      error,
    );
    remote = readLastKnownGood(renderer);
    if (!remote) {
      if (!isLocalFederationFallbackId(renderer)) {
        throw error instanceof Error
          ? error
          : new Error(
              `[electron-boot] unsupported federation renderer "${renderer}"`,
            );
      }
      remote = localFederationRegistration(renderer, httpEntryOverride);
    }
  }
  try {
    const report = createFrontendTelemetryReporter(hostRuntimeAuth());
    if (packagedRemoteUpdatePolicy().pinToExtraResources) {
      report({
        applicationId: renderer,
        entry: remote.entry,
        eventType: 'packaged_pin',
        version: remote.version,
      });
    }
    await mountWithLastKnownGood({
      applicationId: renderer,
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
            id: renderer,
            version: registration.version ?? '0.0.0',
            runtimeConfig:
              renderer === 'demo-board'
                ? {
                    applicationId: 'demo-board',
                    definitionVersion: '1',
                  }
                : undefined,
          },
          initialPath: `${location.pathname}${location.search}${location.hash}`,
        });
      },
    });
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    const labels: Record<string, string> = {
      docs: '文档',
      settings: '设置',
      integration: '集成平台',
      'low-code-studio': '低代码工作室',
      'demo-board': '运营大屏',
    };
    const label = labels[renderer] ?? renderer;
    root.innerHTML = `<div role="alert" style="padding:1.5rem;font:14px/1.5 system-ui,sans-serif">无法加载${label}应用。<pre>${text}</pre><p>请用 <code>vp run dev</code> 或 <code>vp run dev:web</code> 启动 Host；Docs / Settings / Integration 会随 Host 拉起。</p><p>打包模式需要 <code>apps/sub-web/${renderer}/dist</code> 已复制到 extraResources。</p></div>`;
    console.error(error);
  }
}
