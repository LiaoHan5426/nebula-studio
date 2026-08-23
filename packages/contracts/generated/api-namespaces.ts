// AUTO-GENERATED — do not edit manually.
// Source: configs/environments.json apiTargets + internal/node-kit API context

export const GENERATED_API_NAMESPACES = {
  platform: {
    platform: '/api/platform',
    system: '/api/system',
    governance: '/api/security/governance',
    version: '/api/version',
    release: '/api/release',
    releases: '/api/releases',
    task: '/api/task',
    taskInstance: '/api/task/instance',
    config: '/api/config',
  },
  console: {
    console: '/api/console',
    auth: '/api/auth',
    integration: '/api/integration',
    flows: '/api/flows',
    monitor: '/api/monitor',
    cluster: '/api/cluster',
    subscribe: '/api/subscribe',
    camelSubscribe: '/api/subscribe/camel',
    camelTopology: '/api/camel/topology',
  },
  executor: {
    executor: '/api/executor',
  },
} as const;

export type GeneratedApiTarget = keyof typeof GENERATED_API_NAMESPACES;

export const GENERATED_API_TARGETS = {
  platform: 'http://localhost:8090',
  console: 'http://localhost:8080',
  executor: 'http://localhost:8088',
} as const;

export const GENERATED_STANDALONE_APPS = {
  docs: {
    host: 'localhost',
    port: 5176,
    basePath: '/',
    baseUrl: 'http://localhost:5176',
    proxyPreset: null,
    embedPath: '/?embed=docs',
  },
  settings: {
    host: 'localhost',
    port: 5177,
    basePath: '/',
    baseUrl: 'http://localhost:5177',
    proxyPreset: 'standard',
    embedPath: '/?embed=settings',
  },
  integration: {
    host: 'localhost',
    port: 5174,
    basePath: '/',
    baseUrl: 'http://localhost:5174',
    proxyPreset: 'integration',
    embedPath: '/?embed=integration',
  },
} as const;

export const GENERATED_FEDERATION_DEV_ENTRIES = {
  docs: {
    name: 'nebula_docs',
    expose: 'application',
    packagedHost: 'docs',
    defaultHttpEntry: 'http://localhost:5176/mf-manifest.json',
  },
  settings: {
    name: 'nebula_settings',
    expose: 'application',
    packagedHost: 'settings',
    defaultHttpEntry: 'http://localhost:5177/mf-manifest.json',
  },
  integration: {
    name: 'nebula_integration',
    expose: 'application',
    packagedHost: 'integration',
    defaultHttpEntry: 'http://localhost:5174/mf-manifest.json',
  },
  'low-code-studio': {
    name: 'nebula_low_code_studio',
    expose: 'application',
    packagedHost: 'low-code-studio',
    defaultHttpEntry: 'http://localhost:5194/mf-manifest.json',
  },
  'demo-board': {
    name: 'nebula_low_code_studio',
    expose: 'runtime-application',
    packagedHost: 'low-code-studio',
    defaultHttpEntry: 'http://localhost:5194/mf-manifest.json',
  },
} as const;
