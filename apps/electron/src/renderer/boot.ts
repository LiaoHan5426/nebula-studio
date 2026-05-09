import appConfig from '../../app.config';

type WindowId = keyof typeof appConfig.windows;
type RendererPkg = (typeof appConfig.windows)[WindowId]['renderer'];

/**
 * 唯一事实来源：`app.config.ts` 中各 `windows.*.renderer`。
 *
 * 此处使用固定 glob 仅为满足 Vite/Rollup 在构建期收集模块；不做「按包名枚举」的硬编码。
 * 启动时：`app.config` 声明的每个 renderer 必须在磁盘上有对应 `main.ts`（缺一即抛错）。
 * glob 命中 `apps/<包名>/src/main.ts` 但未在配置里声明的包仅 `console.warn` 并跳过（例如只做 Web、尚未挂进 Electron）。
 */
const rendererMainModules = import.meta.glob('../../../*/src/main.ts');

function pkgFromRendererMainGlobKey(key: string): string | undefined {
  const normalized = key.replace(/\\/g, '/');
  return normalized.match(/\/([^/]+)\/src\/main\.ts$/)?.[1];
}

function buildRendererLoaders(): Record<RendererPkg, () => Promise<unknown>> {
  const required = new Set(
    Object.values(appConfig.windows).map((w) => w.renderer),
  );

  const loaders = {} as Partial<Record<RendererPkg, () => Promise<unknown>>>;
  const satisfied = new Set<string>();

  for (const [globKey, loadMod] of Object.entries(rendererMainModules)) {
    const pkg = pkgFromRendererMainGlobKey(globKey);
    if (pkg === undefined) {
      continue;
    }

    if (!required.has(pkg as RendererPkg)) {
      console.warn(
        `[boot] 存在 apps/${pkg}/src/main.ts，但 app.config.windows 未引用 renderer "${pkg}"；已跳过（若需作为 Electron 子应用请在配置中登记）。`,
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
        `boot: app.config 需要 renderer "${pkg}"，但未找到 apps/${pkg}/src/main.ts`,
      );
    }
  }

  return loaders as Record<RendererPkg, () => Promise<unknown>>;
}

const loadMainByRendererPkg = buildRendererLoaders();

function windowIdFromSearch(): WindowId {
  const q = new URLSearchParams(window.location.search).get('renderer');
  if (q !== null && q in appConfig.windows) {
    return q as WindowId;
  }
  return 'main';
}

async function start(): Promise<void> {
  const windowId = windowIdFromSearch();
  const pkg = appConfig.windows[windowId].renderer;
  await loadMainByRendererPkg[pkg]();
}

void start();
