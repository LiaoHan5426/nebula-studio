import { ipcMain, Notification } from 'electron';
import appConfig from '../../../app.config';
import type { MainModule, MainModuleContext } from '../bootstrap/MainModule';
import type {
  AppNotifyLevel,
  AppNotifyPayload,
  AppNotifyResponsePayload,
  AppNotifyType,
  NotifySource,
  NotifyBridgePayload,
} from '@nebula-studio-electron/electron-bridge';

export class IpcNotificationModule implements MainModule {
  readonly name = 'IpcNotification';

  setup(context: MainModuleContext): void {
    const validSources = new Set<string>(Object.keys(appConfig.windows));
    const resolveSource = (source: unknown): NotifySource | null => {
      if (typeof source !== 'string' || source.trim().length === 0) {
        return null;
      }
      const normalized = source.trim();
      if (!validSources.has(normalized)) {
        return null;
      }
      return normalized;
    };

    const handleAppNotify = (
      source: NotifySource,
      payload: AppNotifyPayload,
      sendBack: (channel: string, payload: unknown) => void,
    ) => {
      if (!payload || typeof payload.message !== 'string') {
        context.logger.warn(`[notify:app] Invalid payload from ${source}.`);
        return;
      }

      const type: AppNotifyType =
        payload.type === 'notification' ? 'notification' : 'message';
      const level: AppNotifyLevel =
        payload.level === 'success' ||
        payload.level === 'warning' ||
        payload.level === 'danger'
          ? payload.level
          : 'info';
      const durationMs =
        typeof payload.durationMs === 'number' &&
        Number.isFinite(payload.durationMs) &&
        payload.durationMs > 0
          ? Math.floor(payload.durationMs)
          : undefined;
      const normalized = {
        ...payload,
        type,
        level,
        showCloseButton:
          typeof payload.showCloseButton === 'boolean'
            ? payload.showCloseButton
            : type === 'message',
        durationMs: type === 'notification' ? (durationMs ?? 5000) : durationMs,
      };
      const titlePrefix = payload.title ? `${payload.title}: ` : '';
      context.logger.info(
        `[in-app:${source}:${type}:${level}] ${titlePrefix}${payload.message} [closeButton=${String(normalized.showCloseButton)} durationMs=${String(normalized.durationMs)}]`,
      );
      sendBack('notify:app', normalized);
      return normalized.requestId ?? null;
    };

    const handleSystemNotify = (
      source: NotifySource,
      payload: { title: string; body: string },
    ) => {
      if (!Notification.isSupported()) {
        context.logger.warn(
          `[notify:system] System notifications are not supported. source=${source}`,
        );
        return;
      }
      context.logger.info(
        `[notify:system:${source}] ${payload.title}: ${payload.body}`,
      );
      new Notification({
        title: payload.title,
        body: payload.body,
      }).show();
    };

    const handleAppResponse = (
      source: NotifySource,
      payload: AppNotifyResponsePayload,
      sendBack: (channel: string, payload: unknown) => void,
    ) => {
      if (!payload?.requestId || !payload?.action) {
        context.logger.warn(
          `[notify:app:response] Invalid payload from ${source}.`,
        );
        return;
      }
      context.logger.info(
        `[notify:app:response:${source}] requestId=${payload.requestId} action=${payload.action}`,
      );
      sendBack('notify:app:response', payload);
    };

    ipcMain.handle(
      'notify:app',
      (event, req: NotifyBridgePayload<AppNotifyPayload>) => {
        const source = resolveSource(req?.source);
        if (!source) {
          context.logger.warn('[notify:app] Invalid source.');
          return;
        }
        return handleAppNotify(source, req?.payload, (channel, payload) =>
          event.sender.send(channel, payload),
        );
      },
    );
    ipcMain.handle(
      'notify:bridge:app',
      (event, req: NotifyBridgePayload<AppNotifyPayload>) => {
        const source = resolveSource(req?.source);
        if (!source) {
          context.logger.warn('[notify:bridge:app] Invalid source.');
          return;
        }
        return handleAppNotify(source, req?.payload, (channel, payload) =>
          event.sender.send(channel, payload),
        );
      },
    );
    ipcMain.handle(
      'notify:system',
      (_, req: NotifyBridgePayload<{ title: string; body: string }>) => {
        const source = resolveSource(req?.source);
        if (!source) {
          context.logger.warn('[notify:system] Invalid source.');
          return;
        }
        return handleSystemNotify(source, req?.payload);
      },
    );
    ipcMain.handle(
      'notify:bridge:system',
      (_, req: NotifyBridgePayload<{ title: string; body: string }>) => {
        const source = resolveSource(req?.source);
        if (!source) {
          context.logger.warn('[notify:bridge:system] Invalid source.');
          return;
        }
        return handleSystemNotify(source, req?.payload);
      },
    );
    ipcMain.handle(
      'notify:app:response',
      (event, req: NotifyBridgePayload<AppNotifyResponsePayload>) => {
        const source = resolveSource(req?.source);
        if (!source) {
          context.logger.warn('[notify:app:response] Invalid source.');
          return;
        }
        return handleAppResponse(source, req?.payload, (channel, payload) =>
          event.sender.send(channel, payload),
        );
      },
    );
    ipcMain.handle(
      'notify:bridge:app:response',
      (event, req: NotifyBridgePayload<AppNotifyResponsePayload>) => {
        const source = resolveSource(req?.source);
        if (!source) {
          context.logger.warn('[notify:bridge:app:response] Invalid source.');
          return;
        }
        return handleAppResponse(source, req?.payload, (channel, payload) =>
          event.sender.send(channel, payload),
        );
      },
    );
  }
}
