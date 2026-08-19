import type { InstallNebulaAssemblyFromModeOptions } from '../types/context';

import {
  createElectronHostAdapter,
  createStandaloneHostAdapter,
  createWebHostAdapter,
} from '../host/createHostAdapters';
import { installNebulaAssembly } from './installNebulaAssembly';

export function installNebulaAssemblyFromMode(
  options: InstallNebulaAssemblyFromModeOptions,
) {
  const { mode, hostCapabilities, ...rest } = options;

  const host =
    mode === 'electron'
      ? createElectronHostAdapter(hostCapabilities)
      : mode === 'platform-embed'
        ? createWebHostAdapter(hostCapabilities)
        : createStandaloneHostAdapter(hostCapabilities);

  return installNebulaAssembly({
    ...rest,
    host,
    style: rest.style ?? { density: 'comfortable', theme: 'system' },
  });
}
