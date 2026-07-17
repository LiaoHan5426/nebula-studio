export const SHELL_AUTH_SESSION_KEY = 'nebula-studio-auth-session';

export interface ShellAuthSessionPayload {
  user: string;
  token?: string;
  roles?: string[];
  userId?: string;
}

export function readWebAuthSession(): ShellAuthSessionPayload | null {
  try {
    const raw = sessionStorage.getItem(SHELL_AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShellAuthSessionPayload;
  } catch {
    return null;
  }
}

export function writeWebAuthSession(payload: ShellAuthSessionPayload): void {
  sessionStorage.setItem(SHELL_AUTH_SESSION_KEY, JSON.stringify(payload));
}

export function clearWebAuthSession(): void {
  sessionStorage.removeItem(SHELL_AUTH_SESSION_KEY);
}

export function hasValidShellAuthSession(
  session: ShellAuthSessionPayload | null | undefined,
): boolean {
  const user = session?.user?.trim();
  const token = session?.token?.trim();
  return Boolean(user && token && token.length >= 20);
}
