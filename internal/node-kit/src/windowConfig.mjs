import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import Ajv from 'ajv';

import { joinOrigin } from './joinOrigin.mjs';

export { joinOrigin };

export function resolveWindowConfigPaths(rootDir) {
  return {
    configPath: join(rootDir, 'configs', 'windows.json'),
    schemaPath: join(rootDir, 'configs', 'windows.schema.json'),
    environmentsPath: join(rootDir, 'configs', 'environments.json'),
    environmentsSchemaPath: join(
      rootDir,
      'configs',
      'environments.schema.json',
    ),
    realStackPath: join(rootDir, 'configs', 'real-stack.json'),
    realStackSchemaPath: join(rootDir, 'configs', 'real-stack.schema.json'),
    e2ePath: join(rootDir, 'configs', 'e2e.json'),
    e2eSchemaPath: join(rootDir, 'configs', 'e2e.schema.json'),
    apiContextPath: join(
      rootDir,
      'internal',
      'build-kit',
      'src',
      'config',
      'api-context.json',
    ),
    windowsOutputPath: join(
      rootDir,
      'packages',
      'core',
      'app-shell',
      'src',
      'common',
      '_generated-windows.ts',
    ),
    apiNamespacesPath: join(
      rootDir,
      'packages',
      'contracts',
      'generated',
      'api-namespaces.ts',
    ),
    subWebDir: join(rootDir, 'apps', 'sub-web'),
  };
}

export function loadJsonFile(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function collectRuntimeEntries(config) {
  return [
    ...Object.values(config.windows ?? {}),
    ...Object.values(config.modalRenderers ?? {}),
  ];
}

function assertRendererExists(subWebDir, renderer, field, errors) {
  const rendererDir = join(subWebDir, renderer);
  if (!existsSync(rendererDir)) {
    errors.push(
      `${field}: unknown renderer "${renderer}" (directory not found)`,
    );
  }
}

export function validateWindowsConfig(config, schema, ctx) {
  const { subWebDir, apiContext } = ctx;
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const valid = validate(config);
  const errors = [];

  if (!valid && validate.errors) {
    for (const err of validate.errors) {
      const path = err.instancePath || '(root)';
      errors.push(`${path}: ${err.message ?? 'validation error'}`);
    }
  }

  const rendererIds = new Set();
  if (config.windows) {
    for (const [windowId, win] of Object.entries(config.windows)) {
      rendererIds.add(win.renderer);
      assertRendererExists(
        subWebDir,
        win.renderer,
        `windows.${windowId}.renderer`,
        errors,
      );
    }
  }
  if (config.modalRenderers) {
    for (const [modalId, modal] of Object.entries(config.modalRenderers)) {
      rendererIds.add(modal.renderer);
      assertRendererExists(
        subWebDir,
        modal.renderer,
        `modalRenderers.${modalId}.renderer`,
        errors,
      );
    }
  }

  for (const renderer of rendererIds) {
    const mainTs = join(subWebDir, renderer, 'src', 'main.ts');
    const bootTs = join(subWebDir, renderer, 'src', 'boot.ts');
    if (!existsSync(mainTs)) {
      errors.push(
        `renderer "${renderer}": missing required entry apps/sub-web/${renderer}/src/main.ts`,
      );
    }
    if (!existsSync(bootTs)) {
      errors.push(
        `renderer "${renderer}": missing required entry apps/sub-web/${renderer}/src/boot.ts`,
      );
    }
  }

  const apiTargets = ctx.apiTargets ?? config.apiTargets ?? {};
  for (const target of Object.keys(apiContext.namespaces ?? {})) {
    if (!apiTargets[target]) {
      errors.push(
        `api context namespaces.${target}: missing apiTargets.${target} in environments.json`,
      );
    }
  }
  for (const [preset, routes] of Object.entries(
    apiContext.proxyPresets ?? {},
  )) {
    for (const [index, route] of routes.entries()) {
      if (!apiTargets[route.target]) {
        errors.push(
          `api context proxyPresets.${preset}[${index}].target: unknown apiTargets.${route.target}`,
        );
      }
    }
  }

  const realStack = ctx.realStack ?? config.realStack;
  for (const check of realStack?.healthChecks ?? []) {
    if (!apiTargets[check.target]) {
      errors.push(
        `realStack.healthChecks.${check.id}.target: unknown apiTargets.${check.target}`,
      );
    }
  }

  const openapiTarget = realStack?.openapi?.platform?.target;
  if (openapiTarget && !apiTargets[openapiTarget]) {
    errors.push(
      `realStack.openapi.platform.target: unknown apiTargets.${openapiTarget}`,
    );
  }

  const ports = new Map();
  const shellPort = config.shell?.web?.port;
  if (typeof shellPort === 'number') {
    ports.set(shellPort, 'shell.web');
  }
  for (const entry of collectRuntimeEntries(config)) {
    const port = entry.standalone?.port;
    if (typeof port !== 'number') continue;
    const owner = `renderer "${entry.renderer}"`;
    const existing = ports.get(port);
    if (existing) {
      errors.push(
        `standalone.port ${port} used by both ${existing} and ${owner}`,
      );
    } else {
      ports.set(port, owner);
    }
  }

  return errors;
}

function validateJsonDocument(document, schema, label) {
  const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);
  if (validate(document)) return [];
  return (validate.errors ?? []).map(
    (error) =>
      `${label}${error.instancePath || '(root)'}: ${error.message ?? 'validation error'}`,
  );
}

export function generateWindowsTypeScript(config, apiContext) {
  const lines = [];

  lines.push('// AUTO-GENERATED — do not edit manually.');
  lines.push(
    '// Source: configs/windows.json + internal/build-kit API context black box',
  );
  lines.push('');
  lines.push(
    "export type GeneratedPreloadCapability = 'auth' | 'notify' | 'settings' | 'shell';",
  );
  lines.push('');
  lines.push('export interface GeneratedWindowEntry {');
  lines.push('  preload: string;');
  lines.push('  renderer: string;');
  lines.push('  webEmbedEntry?: string;');
  lines.push("  webLoad?: 'embed' | 'federation' | 'host';");
  lines.push('  preloadCapabilities: GeneratedPreloadCapability[];');
  lines.push("  proxyPreset?: 'integration' | 'standard';");
  lines.push(
    '  standalone?: { host?: string; port: number; basePath?: string };',
  );
  lines.push('}');
  lines.push('');
  lines.push('export interface GeneratedModalRendererEntry {');
  lines.push('  preload: string;');
  lines.push('  renderer: string;');
  lines.push('  webEmbedEntry?: string;');
  lines.push("  webLoad?: 'embed' | 'federation' | 'host';");
  lines.push('  preloadCapabilities: GeneratedPreloadCapability[];');
  lines.push("  proxyPreset?: 'integration' | 'standard';");
  lines.push(
    '  standalone?: { host?: string; port: number; basePath?: string };',
  );
  lines.push('}');
  lines.push('');

  if (config.shell) {
    lines.push('export const GENERATED_SHELL_CONFIG = {');
    for (const [key, value] of Object.entries(config.shell)) {
      lines.push(`  ${key}: ${JSON.stringify(value)},`);
    }
    lines.push('} as const;');
    lines.push('');
  }

  if (config.electronEmbeddedPresentation) {
    lines.push(
      `export const GENERATED_ELECTRON_EMBEDDED_PRESENTATION = ${JSON.stringify(config.electronEmbeddedPresentation)} as const;`,
    );
    lines.push('');
  }

  lines.push(
    'export const GENERATED_WINDOWS: Record<string, GeneratedWindowEntry> = {',
  );
  for (const [windowId, win] of Object.entries(config.windows)) {
    lines.push(`  ${JSON.stringify(windowId)}: {`);
    lines.push(`    preload: ${JSON.stringify(win.preload)},`);
    lines.push(`    renderer: ${JSON.stringify(win.renderer)},`);
    if (win.webEmbedEntry)
      lines.push(`    webEmbedEntry: ${JSON.stringify(win.webEmbedEntry)},`);
    if (win.webLoad) lines.push(`    webLoad: ${JSON.stringify(win.webLoad)},`);
    if (win.preloadCapabilities)
      lines.push(
        `    preloadCapabilities: ${JSON.stringify(win.preloadCapabilities)},`,
      );
    if (win.proxyPreset)
      lines.push(`    proxyPreset: ${JSON.stringify(win.proxyPreset)},`);
    if (win.standalone)
      lines.push(`    standalone: ${JSON.stringify(win.standalone)},`);
    lines.push('  },');
  }
  lines.push('} as const;');
  lines.push('');

  if (config.modalRenderers && Object.keys(config.modalRenderers).length > 0) {
    lines.push(
      'export const GENERATED_MODAL_RENDERERS: Record<string, GeneratedModalRendererEntry> = {',
    );
    for (const [modalId, modal] of Object.entries(config.modalRenderers)) {
      lines.push(`  ${JSON.stringify(modalId)}: {`);
      lines.push(`    preload: ${JSON.stringify(modal.preload)},`);
      lines.push(`    renderer: ${JSON.stringify(modal.renderer)},`);
      if (modal.webEmbedEntry)
        lines.push(
          `    webEmbedEntry: ${JSON.stringify(modal.webEmbedEntry)},`,
        );
      if (modal.webLoad)
        lines.push(`    webLoad: ${JSON.stringify(modal.webLoad)},`);
      if (modal.preloadCapabilities) {
        lines.push(
          `    preloadCapabilities: ${JSON.stringify(modal.preloadCapabilities)},`,
        );
      }
      if (modal.proxyPreset)
        lines.push(`    proxyPreset: ${JSON.stringify(modal.proxyPreset)},`);
      if (modal.standalone)
        lines.push(`    standalone: ${JSON.stringify(modal.standalone)},`);
      lines.push('  },');
    }
    lines.push('} as const;');
    lines.push('');
  }

  lines.push('export const GENERATED_DISPLAY_ORDER: readonly string[] = [];');
  lines.push('');

  lines.push(
    `export const GENERATED_API_NAMESPACES = ${JSON.stringify(apiContext.namespaces ?? {}, null, 2)} as const;`,
  );
  lines.push('');

  if (config.apiTargets) {
    lines.push(
      `export const GENERATED_API_TARGETS: Record<string, string> = ${JSON.stringify(config.apiTargets, null, 2)} as const;`,
    );
    lines.push('');
  }

  const shellWeb = config.shell?.web;
  if (shellWeb) {
    const shellBaseUrl = joinOrigin(
      `http://${shellWeb.host}:${shellWeb.port}`,
      shellWeb.basePath ?? '/',
    );
    lines.push(
      `export const GENERATED_SHELL_WEB_BASE_URL = ${JSON.stringify(shellBaseUrl)} as const;`,
    );
    lines.push('');
  }

  if (config.shell?.electron?.rendererEntry) {
    lines.push(
      `export const GENERATED_ELECTRON_RENDERER_ENTRY = ${JSON.stringify(config.shell.electron.rendererEntry)} as const;`,
    );
    lines.push('');
  }

  if (config.shell?.embedQuery) {
    lines.push(
      `export const GENERATED_SHELL_EMBED_QUERY = ${JSON.stringify(config.shell.embedQuery)} as const;`,
    );
    lines.push('');
  }

  lines.push(
    `export const GENERATED_STANDALONE_APPS = ${JSON.stringify(collectStandaloneApps(config), null, 2)} as const;`,
  );
  lines.push('');

  if (config.realStack) {
    lines.push(
      `export const GENERATED_REAL_STACK = ${JSON.stringify(config.realStack, null, 2)} as const;`,
    );
    lines.push('');
  }

  if (config.e2e) {
    lines.push(
      `export const GENERATED_E2E = ${JSON.stringify(config.e2e, null, 2)} as const;`,
    );
    lines.push('');
  }

  if (config.rendererSources) {
    lines.push(
      `export const GENERATED_RENDERER_SOURCES: Record<string, string> = ${JSON.stringify(config.rendererSources, null, 2)} as const;`,
    );
    lines.push('');
  }

  const windowIds = Object.keys(config.windows);
  lines.push(
    `export type GeneratedWindowId = ${windowIds.map((id) => JSON.stringify(id)).join(' | ')};`,
  );
  lines.push('');

  return lines.join('\n');
}

export function collectStandaloneApps(config) {
  const standaloneApps = {};
  for (const entry of collectRuntimeEntries(config)) {
    if (!entry.standalone) continue;
    const host = entry.standalone.host ?? config.shell?.web?.host;
    if (!host) {
      throw new Error(
        `renderer "${entry.renderer}" standalone.host is missing and shell.web.host is not set`,
      );
    }
    const basePath = entry.standalone.basePath ?? '/';
    standaloneApps[entry.renderer] = {
      host,
      port: entry.standalone.port,
      basePath,
      baseUrl: joinOrigin(`http://${host}:${entry.standalone.port}`, basePath),
      proxyPreset: entry.proxyPreset ?? null,
      embedPath:
        entry.webEmbedEntry ||
        entry.webLoad === 'federation' ||
        entry.webLoad === 'host'
          ? `/?${config.shell?.embedQuery ?? 'embed'}=${entry.renderer}`
          : null,
    };
  }
  return standaloneApps;
}

export function collectFederationDevEntries(config) {
  const standaloneApps = collectStandaloneApps(config);
  const entries = {};
  for (const [windowId, win] of Object.entries(config.windows ?? {})) {
    if (win.webLoad !== 'federation') continue;
    const standalone = standaloneApps[win.renderer];
    if (!standalone) {
      throw new Error(
        `federation window "${windowId}" is missing standalone host/port`,
      );
    }
    entries[windowId] = {
      name: `nebula_${win.renderer}`,
      expose: 'application',
      packagedHost: win.renderer,
      defaultHttpEntry: `${String(standalone.baseUrl).replace(/\/$/, '')}/mf-manifest.json`,
    };
  }
  return entries;
}

export function generateApiNamespacesSource(config, apiContext) {
  const federationDevEntries = {
    ...collectFederationDevEntries(config),
    ...config.federationDevEntries,
  };
  return [
    '// AUTO-GENERATED — do not edit manually.',
    '// Source: configs/environments.json apiTargets + internal/build-kit API context',
    '',
    `export const GENERATED_API_NAMESPACES = ${JSON.stringify(apiContext.namespaces ?? {}, null, 2)} as const;`,
    '',
    'export type GeneratedApiTarget = keyof typeof GENERATED_API_NAMESPACES;',
    '',
    `export const GENERATED_API_TARGETS = ${JSON.stringify(config.apiTargets ?? {}, null, 2)} as const;`,
    '',
    `export const GENERATED_STANDALONE_APPS = ${JSON.stringify(collectStandaloneApps(config), null, 2)} as const;`,
    '',
    `export const GENERATED_FEDERATION_DEV_ENTRIES = ${JSON.stringify(federationDevEntries, null, 2)} as const;`,
    '',
  ].join('\n');
}

export function buildWindowConfigArtifacts(rootDir) {
  const paths = resolveWindowConfigPaths(rootDir);
  const windows = loadJsonFile(paths.configPath);
  const environments = loadJsonFile(paths.environmentsPath);
  const realStack = loadJsonFile(paths.realStackPath);
  const e2e = loadJsonFile(paths.e2ePath);
  const config = {
    ...windows,
    apiTargets: environments.apiTargets ?? {},
    federationDevEntries: environments.federationDevEntries ?? {},
    realStack,
    e2e,
  };
  const schema = loadJsonFile(paths.schemaPath);
  if (!existsSync(paths.apiContextPath)) {
    throw new Error(`Missing API context black box at ${paths.apiContextPath}`);
  }
  const apiContext = loadJsonFile(paths.apiContextPath);
  const errors = [
    ...validateJsonDocument(
      environments,
      loadJsonFile(paths.environmentsSchemaPath),
      'environments',
    ),
    ...validateJsonDocument(
      realStack,
      loadJsonFile(paths.realStackSchemaPath),
      'real-stack',
    ),
    ...validateJsonDocument(e2e, loadJsonFile(paths.e2eSchemaPath), 'e2e'),
    ...validateWindowsConfig(windows, schema, {
      subWebDir: paths.subWebDir,
      apiContext,
      apiTargets: environments.apiTargets ?? {},
      realStack,
    }),
  ];
  if (errors.length > 0) {
    throw new Error(
      `Validation failed:\n${errors.map((err) => `   - ${err}`).join('\n')}`,
    );
  }
  return {
    paths,
    windowsTs: generateWindowsTypeScript(config, apiContext),
    apiNamespacesTs: generateApiNamespacesSource(config, apiContext),
  };
}

export function writeWindowConfigArtifacts(rootDir) {
  const { paths, windowsTs, apiNamespacesTs } =
    buildWindowConfigArtifacts(rootDir);
  mkdirSync(dirname(paths.windowsOutputPath), { recursive: true });
  mkdirSync(dirname(paths.apiNamespacesPath), { recursive: true });
  writeFileSync(paths.windowsOutputPath, windowsTs, 'utf8');
  writeFileSync(paths.apiNamespacesPath, apiNamespacesTs, 'utf8');
  return paths;
}
