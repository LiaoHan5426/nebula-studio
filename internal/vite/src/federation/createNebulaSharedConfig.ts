export type NebulaSharedLibrary = 'application-contract' | 'vue' | 'vue-router';

export interface CreateNebulaSharedConfigOptions {
  libraries?: readonly NebulaSharedLibrary[];
}

export interface NebulaSharedEntry {
  singleton?: boolean;
  requiredVersion?: string | false;
  strictVersion?: boolean;
  eager?: boolean;
}

const PACKAGE_NAME: Record<NebulaSharedLibrary, string> = {
  vue: 'vue',
  'vue-router': 'vue-router',
  'application-contract': '@nebula-studio/application-contract',
};

/**
 * Single-source shared policy for A-track Host/Remote builds.
 * Pinia / vue-i18n / vue-query stay off the default set until track B.
 */
const POLICY: Record<NebulaSharedLibrary, NebulaSharedEntry> = {
  vue: {
    singleton: true,
    requiredVersion: '^3.5.0',
    strictVersion: false,
    eager: false,
  },
  'vue-router': {
    singleton: true,
    requiredVersion: '^4.6.0',
    strictVersion: false,
    eager: false,
  },
  'application-contract': {
    singleton: true,
    requiredVersion: false,
    eager: false,
  },
};

export function createNebulaSharedConfig(
  options?: CreateNebulaSharedConfigOptions,
): Record<string, NebulaSharedEntry> {
  const libraries = options?.libraries ?? ['vue', 'application-contract'];
  const shared: Record<string, NebulaSharedEntry> = {};
  for (const library of libraries) {
    shared[PACKAGE_NAME[library]] = POLICY[library];
  }
  return shared;
}
