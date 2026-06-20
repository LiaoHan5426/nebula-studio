import { fetchAuthMode } from '@nebula-studio/app-shell';
import type { AuthMode } from '@nebula-studio/app-shell';

let cachedMode: AuthMode | null = null;

export async function ensureAuthMode(): Promise<AuthMode> {
  if (cachedMode) return cachedMode;
  try {
    cachedMode = await fetchAuthMode();
  } catch {
    cachedMode = {
      authType: 'token',
      orgEnabled: false,
      multiOrgEnabled: false,
    };
  }
  return cachedMode;
}

export function isSessionAuthMode(mode: AuthMode): boolean {
  return mode.authType.toLowerCase() === 'session';
}

export function resetAuthModeCache(): void {
  cachedMode = null;
}
