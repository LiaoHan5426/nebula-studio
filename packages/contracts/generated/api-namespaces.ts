// AUTO-GENERATED — do not edit manually.
// Source: configs/windows.json apiTargets + internal/vite API context

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
