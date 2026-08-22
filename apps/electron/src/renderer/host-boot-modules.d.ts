declare module '@nebula-host-boot/workspace' {
  export function bootHostWorkspace(
    mode: 'electron' | 'platform-embed' | 'standalone',
  ): Promise<void>;
}

declare module '@nebula-host-boot/login' {
  export function bootHostLogin(
    mode: 'electron' | 'platform-embed' | 'standalone',
  ): Promise<void>;
}
