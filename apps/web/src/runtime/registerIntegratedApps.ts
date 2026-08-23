import { hydrateShellIntegratedAppsFromRuntime } from '../platform/integratedApps';

export async function registerIntegratedApps(): Promise<void> {
  await hydrateShellIntegratedAppsFromRuntime();
}
