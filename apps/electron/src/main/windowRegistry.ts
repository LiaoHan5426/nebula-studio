import appConfig from '../../app.config';

type Windows = typeof appConfig.windows;
export type MainWindowId = keyof Windows;
export type EmbeddedWindowId = Exclude<MainWindowId, 'main'>;

export function resolveRendererEntry(windowId: string): {
  preload: string;
  renderer: string;
} {
  if (windowId in appConfig.windows) {
    const entry = appConfig.windows[windowId as MainWindowId];
    if (!entry) throw new Error(`Window config not found: ${windowId}`);
    return entry;
  }
  if ('modalRenderers' in appConfig && windowId in appConfig.modalRenderers) {
    const entry =
      appConfig.modalRenderers[
        windowId as keyof typeof appConfig.modalRenderers
      ];
    if (!entry) throw new Error(`Modal renderer config not found: ${windowId}`);
    return entry;
  }
  throw new Error(`Unknown windowId: ${windowId}`);
}

export function listEmbeddedWindowIds(): EmbeddedWindowId[] {
  return (Object.keys(appConfig.windows) as MainWindowId[]).filter(
    (id): id is EmbeddedWindowId => id !== 'main',
  );
}
