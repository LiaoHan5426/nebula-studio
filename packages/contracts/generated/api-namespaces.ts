// AUTO-GENERATED — do not edit manually.
// Source: configs/windows.json

export const GENERATED_API_BASES = {
  console: '/api/console',
  executor: '/api/executor',
  platform: '/api/platform',
  system: '/api/system',
  auth: '/api/auth',
  governance: '/api/security/governance',
  version: '/api/version',
  release: '/api/release',
  releases: '/api/releases',
  integration: '/api/integration',
  flows: '/api/flows',
  monitor: '/api/monitor',
  task: '/api/task',
  taskInstance: '/api/task/instance',
  cluster: '/api/cluster',
  subscribe: '/api/subscribe',
  camelSubscribe: '/api/subscribe/camel',
  camelTopology: '/api/camel/topology',
  config: '/api/config',
} as const;

export type GeneratedApiNamespace = keyof typeof GENERATED_API_BASES;

export const GENERATED_API_TARGETS = {
  platform: 'http://localhost:8090',
  console: 'http://localhost:8080',
  executor: 'http://localhost:8088',
} as const;

export type GeneratedApiTarget = keyof typeof GENERATED_API_TARGETS;
