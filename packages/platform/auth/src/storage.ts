export const SHELL_AUTH_SESSION_KEY = 'nebula-studio-auth-session';

export interface ShellAuthSessionPayload {
  roles?: string[];
  token?: string;
  user: string;
  userId?: string;
}

export function readWebAuthSession(): null | ShellAuthSessionPayload {
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
  session: null | ShellAuthSessionPayload | undefined,
): boolean {
  const user = session?.user?.trim();
  const token = session?.token?.trim();
  return Boolean(user && token && token.length >= 20);
}
