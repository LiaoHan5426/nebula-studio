/**
 * 与 Electron 壳层布局一致的**可序列化**配置（不含 `import.meta` / 主进程路径）。
 * `apps/electron/app.config.ts` 应从此处展开，保证 Web 多页构建与桌面版同源。
 */
export const shellPresentationConfig = {
  shell: {
    /** 与壳层顶栏一致；BrowserView / Web iframe 内容区从该高度之下开始 */
    topInsetPx: 56,
  },
  windows: {
    main: {
      preload: 'main',
      renderer: 'frontend',
    },
    docs: {
      preload: 'docs',
      renderer: 'docs',
    },
    settings: {
      preload: 'settings',
      renderer: 'settings',
    },
    integration: {
      preload: 'main',
      renderer: 'integration',
    },
  },
} as const;

export type ShellWindowId = keyof typeof shellPresentationConfig.windows;

export type EmbeddedShellWindowId = Exclude<ShellWindowId, 'main'>;

export function getEmbeddedShellWindowIds(): EmbeddedShellWindowId[] {
  return (
    Object.keys(shellPresentationConfig.windows) as ShellWindowId[]
  ).filter((id): id is EmbeddedShellWindowId => id !== 'main');
}

/** 与 `apps/web` 中 `web-boot` 使用的查询参数一致，用于 iframe `index.html?…` */
export const WEB_SHELL_EMBED_QUERY = 'embed' as const;
