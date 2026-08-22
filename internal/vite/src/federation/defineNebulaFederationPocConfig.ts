import type { DefineNebulaRemoteConfigOptions } from './defineNebulaRemoteConfig.ts';

import { defineNebulaRemoteConfig } from './defineNebulaRemoteConfig.ts';

export type DefineNebulaFederationPocConfigOptions = {
  configModuleUrl: string | URL;
  cssNamespace: string;
  devPort: number;
  exposes?: Record<string, string>;
  federationName: string;
};

/** @deprecated Use defineNebulaRemoteConfig({ appId, ... }). */
export function defineNebulaFederationPocConfig(
  options: DefineNebulaFederationPocConfigOptions,
) {
  return defineNebulaRemoteConfig({
    configModuleUrl: options.configModuleUrl,
    appId: options.cssNamespace,
    cssNamespace: options.cssNamespace,
    federationName: options.federationName,
    exposes: options.exposes,
    devPort: options.devPort,
  });
}

export type { DefineNebulaRemoteConfigOptions };
