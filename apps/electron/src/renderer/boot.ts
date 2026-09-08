import { installShellIframeElectronBridge } from '@nebula-studio/shell-host';
import { WEB_SHELL_EMBED_QUERY } from '@nebula-studio/shell-protocol';
import '@nebula-studio/styles/document';

import appConfig from '../../app.config';
import { resolveRendererEntry } from '../main/windowRegistry';
import { bootFederationRenderer } from './bootFederation';

import './styles/electron-overrides.css';

document.documentElement.dataset.platform = 'electron';

type WindowId = keyof typeof appConfig.windows;
type ModalId = keyof typeof appConfig.modalRenderers;
type AnyBootWindowId = ModalId | WindowId;
type RendererPkg =
  | (typeof appConfig.modalRenderers)[ModalId]['renderer']
  | (typeof appConfig.windows)[WindowId]['renderer'];

function isFederationRenderer(pkg: string): boolean {
  return Object.values(appConfig.windows).some(
    (entry) => entry.renderer === pkg && entry.webLoad === 'federation',
  );
}

function isHostOwnedRenderer(pkg: string): pkg is 'frontend' | 'login' {
  return pkg === 'frontend' || pkg === 'login';
}

function installRendererHmrFallback(rendererPkg: RendererPkg): void {
  if (!import.meta.hot) {
    return;
  }
  import.meta.hot.on('vite:afterUpdate', (payload) => {
    const hitCurrentRenderer = payload.updates.some((update) => {
      const path = update.path.replace(/\\/g, '/');
      if (path.includes(`/${rendererPkg}/`)) return true;
      if (isHostOwnedRenderer(rendererPkg) && path.includes('/apps/web/')) {
        return true;
      }
      return false;
    });
    if (hitCurrentRenderer) {
      window.location.reload();
    }
  });
}

function surfaceFromSearch(): null | string {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('renderer') ?? params.get(WEB_SHELL_EMBED_QUERY);
  return q && q.trim() ? q.trim() : null;
}

function isConfiguredWindowOrModal(id: string): id is AnyBootWindowId {
  return id in appConfig.windows || id in appConfig.modalRenderers;
}

async function bootHostOwnedRenderer(pkg: 'frontend' | 'login'): Promise<void> {
  if (pkg === 'frontend') {
    const { bootHostWorkspace } = await import('@nebula-host-boot/workspace');
    await bootHostWorkspace('electron');
    return;
  }
  const { bootHostLogin } = await import('@nebula-host-boot/login');
  await bootHostLogin('electron');
}

async function start(): Promise<void> {
  window.__NEBULA_RUNTIME_MODE__ = 'electron';
  if (window.parent !== window) {
    installShellIframeElectronBridge();
  }

  const surface = surfaceFromSearch();

  // windows.json / modalRenderers: host shell, login, or MF remotes (docs/…)
  if (surface && isConfiguredWindowOrModal(surface)) {
    const pkg = resolveRendererEntry(surface).renderer as RendererPkg;
    if (isFederationRenderer(pkg)) {
      await bootFederationRenderer(pkg);
      return;
    }
    if (isHostOwnedRenderer(pkg)) {
      installRendererHmrFallback(pkg);
      console.info(
        `[electron-boot] host-owned renderer "${pkg}" ${window.location.href}`,
      );
      await bootHostOwnedRenderer(pkg);
      return;
    }
    throw new Error(`boot: renderer "${pkg}" has no registered loader`);
  }

  // Host-owned federation apps not in windows.json (low-code-studio, demo-board,
  // runtime-discovered remotes). Must NOT fall through to main — that re-boots
  // the Workspace shell inside the iframe (nested chrome / hall of mirrors).
  if (surface && surface !== 'main') {
    console.info(
      `[electron-boot] federation surface "${surface}" ${window.location.href}`,
    );
    await bootFederationRenderer(surface);
    return;
  }

  const pkg = resolveRendererEntry('main').renderer as RendererPkg;
  if (!isHostOwnedRenderer(pkg)) {
    throw new Error(`boot: main renderer "${pkg}" is not host-owned`);
  }
  installRendererHmrFallback(pkg);
  console.info(
    `[electron-boot] host-owned renderer "${pkg}" ${window.location.href}`,
  );
  await bootHostOwnedRenderer(pkg);
}

void start();
