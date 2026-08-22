import { fileURLToPath } from 'node:url';

import { defineNebulaConfig } from '../defineNebulaConfig.ts';
import { nebulaFederationHostPlugin } from './nebulaFederationHostPlugin.ts';

export interface DefineNebulaHostConfigOptions {
  configModuleUrl: string | URL;
  devPort: number;
  federationName: string;
}

export function defineNebulaHostConfig(options: DefineNebulaHostConfigOptions) {
  const root = fileURLToPath(new URL('.', options.configModuleUrl));
  return defineNebulaConfig({
    platform: 'web',
    root,
    chunks: { enabled: false },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    merge: {
      plugins: [...nebulaFederationHostPlugin(options.federationName)],
      server: {
        port: options.devPort,
        cors: true,
      },
    },
  });
}
