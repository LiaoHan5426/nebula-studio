import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { resolveRepositoryRoot } from '../common/utils.ts';
import { loadAppConfig } from '../config/app-config.ts';
import {
  applyReplacementRules,
  replaceOrThrow,
  withJsonTrailingNewline,
} from '../../packages/utils/src/text.ts';

type FullAppConfig = {
  dirs?: {
    electron?: string;
    preload?: string;
  };
  windows?: Record<string, string>;
  build: {
    appName: string;
    appVersion: string;
    appBuildNumber: number;
    apiVersion: string;
  };
};

const rootDir = resolveRepositoryRoot(import.meta.url);
const appsDir = resolve(rootDir, 'apps');

async function loadFullAppConfig(): Promise<FullAppConfig> {
  const configPath = resolve(appsDir, 'app.config.ts');
  const { default: config } = await import(configPath);
  return config as FullAppConfig;
}

function getElectronDir(appConfig: FullAppConfig): string {
  return appConfig.dirs?.electron ?? 'electron';
}

// function getPreloadDir(appConfig: FullAppConfig): string {
//   return appConfig.dirs?.preload ?? 'electron-preload';
// }

function getMainWindowFrontendDir(appConfig: FullAppConfig): string {
  return appConfig.windows?.main ?? 'frontend';
}

const WORKSPACE_PACKAGE_PATHS = [
  'package.json',
  'apps/electron/package.json',
  'packages/capacitor-electron/package.json',
  'packages/utils/package.json',
  'packages/vite-electron-plugin/package.json',
] as const;

async function updateFrontendTitle(
  appName: string,
  appConfig: FullAppConfig,
): Promise<void> {
  const frontendDir = getMainWindowFrontendDir(appConfig);
  const filePath = resolve(appsDir, frontendDir, 'index.html');
  const content = await readFile(filePath, 'utf8');
  const next = replaceOrThrow(
    content,
    /<title>[\s\S]*?<\/title>/,
    `<title>${appName}</title>`,
    'frontend title',
  );
  await writeFile(filePath, next, 'utf8');
}

async function updateElectronPackageProductName(
  appName: string,
  appVersion: string,
  appConfig: FullAppConfig,
): Promise<void> {
  const electronDir = getElectronDir(appConfig);
  const filePath = resolve(appsDir, electronDir, 'package.json');
  const raw = await readFile(filePath, 'utf8');
  const json = JSON.parse(raw) as {
    version?: string;
    build?: {
      productName?: string;
      artifactName?: string;
    };
  };
  json.version = appVersion;
  json.build = json.build ?? {};
  json.build.productName = appName;
  json.build.artifactName = '${productName}-${version}-${os}-${arch}.${ext}';
  await writeFile(filePath, withJsonTrailingNewline(json), 'utf8');
}

async function updateWorkspaceVersions(appVersion: string): Promise<void> {
  for (const relativePath of WORKSPACE_PACKAGE_PATHS) {
    const filePath = resolve(rootDir, relativePath);
    const raw = await readFile(filePath, 'utf8');
    const json = JSON.parse(raw) as { version?: string };
    json.version = appVersion;
    await writeFile(filePath, withJsonTrailingNewline(json), 'utf8');
  }
}

async function updateCapacitorAppNames(
  appName: string,
  appConfig: FullAppConfig,
): Promise<void> {
  const electronDir = getElectronDir(appConfig);
  const targets = [
    {
      relativePath: resolve(appsDir, electronDir, 'capacitor.config.ts'),
      label: 'electron capacitor appName',
    },
  ] as const;

  for (const target of targets) {
    const filePath = target.relativePath;
    const content = await readFile(filePath, 'utf8');
    const next = replaceOrThrow(
      content,
      /appName:\s*"[^"]*"/,
      `appName: "${appName}"`,
      target.label,
    );
    await writeFile(filePath, next, 'utf8');
  }
}

async function updateBridgeApiVersion(apiVersion: string): Promise<void> {
  const major = apiVersion.split('.')[0] ?? '1';
  const constantsPath = resolve(
    rootDir,
    'packages/capacitor-electron/src/shared/protocol/constants.ts',
  );
  const readmePath = resolve(rootDir, 'packages/capacitor-electron/README.md');

  const constants = await readFile(constantsPath, 'utf8');
  const nextConstants = applyReplacementRules(constants, [
    {
      pattern: /BRIDGE_PROTOCOL_VERSION = "[^"]+"/,
      replacement: `BRIDGE_PROTOCOL_VERSION = "${apiVersion}"`,
      label: 'bridge protocol version',
    },
    {
      pattern: /BRIDGE_INVOKE_CHANNEL = "[^"]+"/,
      replacement: `BRIDGE_INVOKE_CHANNEL = "crosscraft:cap-electron:v${major}:invoke"`,
      label: 'bridge invoke channel version',
    },
  ]);
  await writeFile(constantsPath, nextConstants, 'utf8');

  const readme = await readFile(readmePath, 'utf8');
  const nextReadme = replaceOrThrow(
    readme,
    /- Protocol version: `[^`]+`/,
    `- Protocol version: \`${apiVersion}\``,
    'bridge README protocol version',
  );
  await writeFile(readmePath, nextReadme, 'utf8');
}

type SyncUpdater = {
  label: string;
  execute(config: {
    appName: string;
    appVersion: string;
    appBuildNumber: number;
    apiVersion: string;
    appConfig: FullAppConfig;
  }): Promise<void>;
};

const syncUpdaters: readonly SyncUpdater[] = [
  {
    label: 'workspace package versions',
    execute: async ({ appVersion }) => updateWorkspaceVersions(appVersion),
  },
  {
    label: 'frontend title',
    execute: async ({ appName, appConfig }) =>
      updateFrontendTitle(appName, appConfig),
  },
  {
    label: 'electron package product info',
    execute: async ({ appName, appVersion, appConfig }) =>
      updateElectronPackageProductName(appName, appVersion, appConfig),
  },
  {
    label: 'capacitor app names',
    execute: async ({ appName, appConfig }) =>
      updateCapacitorAppNames(appName, appConfig),
  },
  {
    label: 'bridge api version',
    execute: async ({ apiVersion }) => updateBridgeApiVersion(apiVersion),
  },
];

async function main(): Promise<void> {
  const buildConfig = loadAppConfig(import.meta.url);
  const appConfig = await loadFullAppConfig();

  for (const updater of syncUpdaters) {
    await updater.execute({
      ...buildConfig,
      appConfig,
    });
  }
  console.log(
    `[sync-app-config] synced appName="${buildConfig.appName}" appVersion="${buildConfig.appVersion}" build=${String(buildConfig.appBuildNumber)} apiVersion="${buildConfig.apiVersion}"`,
  );
}

await main();
