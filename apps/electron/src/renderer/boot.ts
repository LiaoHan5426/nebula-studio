import '@nebula-studio-internal/tailwind/electron';
import './styles/electron-overrides.css';

import appConfig from '../../app.config';
import { resolveRendererEntry } from '../main/windowRegistry';

type WindowId = keyof typeof appConfig.windows;
type ModalId = keyof typeof appConfig.modalRenderers;
type AnyBootWindowId = WindowId | ModalId;
type RendererPkg =
  | (typeof appConfig.windows)[WindowId]['renderer']
  | (typeof appConfig.modalRenderers)[ModalId]['renderer'];

/**
 * 唯一事实来源：`app.config.ts` 中 `windows.*.renderer` 与 `modalRenderers.*.renderer`。
 *
 * 此处使用固定 glob 仅为满足 Vite/Rollup 在构建期收集模块；不做「按包名枚举」的硬编码。
 * 须与 `app.config.ts` 的 `renderers` 段一致（当前：`apps/sub-web/<包>/src/main.ts`）。
 * 启动时：配置声明的每个 renderer 必须在磁盘上有对应 `main.ts`（缺一即抛错）。
 */
const rendererMainModules = import.meta.glob('../../../sub-web/*/src/main.ts');

function pkgFromRendererMainGlobKey(key: string): string | undefined {
  const normalized = key.replace(/\\/g, '/');
  return normalized.match(/\/([^/]+)\/src\/main\.ts$/)?.[1];
}

function buildRendererLoaders(): Record<RendererPkg, () => Promise<unknown>> {
  const required = new Set<string>();
  for (const w of Object.values(appConfig.windows)) {
    required.add(w.renderer);
  }
  for (const w of Object.values(appConfig.modalRenderers)) {
    required.add(w.renderer);
  }

  const loaders = {} as Partial<Record<RendererPkg, () => Promise<unknown>>>;
  const satisfied = new Set<string>();

  for (const [globKey, loadMod] of Object.entries(rendererMainModules)) {
    const pkg = pkgFromRendererMainGlobKey(globKey);
    if (pkg === undefined) {
      continue;
    }

    if (!required.has(pkg)) {
      console.warn(
        `[boot] 存在 apps/sub-web/${pkg}/src/main.ts，但 app.config 未引用 renderer "${pkg}"；已跳过。`,
      );
      continue;
    }

    if (satisfied.has(pkg)) {
      throw new Error(`boot: renderer "${pkg}" 匹配到多个 glob 入口`);
    }

    satisfied.add(pkg);
    loaders[pkg as RendererPkg] = loadMod as () => Promise<unknown>;
  }

  for (const pkg of required) {
    if (!satisfied.has(pkg)) {
      throw new Error(
        `boot: app.config 需要 renderer "${pkg}"，但未找到 apps/sub-web/${pkg}/src/main.ts`,
      );
    }
  }

  return loaders as Record<RendererPkg, () => Promise<unknown>>;
}

const loadMainByRendererPkg = buildRendererLoaders();

function installRendererHmrFallback(rendererPkg: RendererPkg): void {
  if (!import.meta.hot) {
    return;
  }
  import.meta.hot.on('vite:afterUpdate', (payload) => {
    const hitCurrentRenderer = payload.updates.some((update) =>
      update.path.replace(/\\/g, '/').includes(`/${rendererPkg}/`),
    );
    if (hitCurrentRenderer) {
      window.location.reload();
    }
  });
}

function windowIdFromSearch(): AnyBootWindowId {
  const q = new URLSearchParams(window.location.search).get('renderer');
  if (q !== null && q in appConfig.windows) {
    return q as WindowId;
  }
  if (q !== null && q in appConfig.modalRenderers) {
    return q as ModalId;
  }
  return 'main';
}

async function start(): Promise<void> {
  const windowId = windowIdFromSearch();
  resolveRendererEntry(windowId);
  const pkg = resolveRendererEntry(windowId).renderer as RendererPkg;
  installRendererHmrFallback(pkg);
  await loadMainByRendererPkg[pkg]();
}

void start();
