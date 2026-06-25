import { useElectronNotify } from '@nebula-studio-electron/electron-bridge/vue';
import type {
  AppNotifyLevel,
  AppNotifyPayload,
  AppNotifyType,
} from '@nebula-studio-electron/electron-bridge';

export function useDocsNotify() {
  const notify = useElectronNotify();

  const sendAppNotify = async (
    type: AppNotifyType,
    level: AppNotifyLevel,
    options?: Partial<AppNotifyPayload>,
  ) => {
    await notify.sendAppNotify(type, level, {
      title: `Docs ${type}`,
      message: `In-app ${type} with level "${level}".`,
      ...options,
    });
  };

  const sendMessageDefault = async () => {
    await sendAppNotify('message', 'info', {
      message: 'Message 默认仅可通过关闭按钮关闭。',
    });
  };

  const sendMessageTimed = async () => {
    await sendAppNotify('message', 'success', {
      message: 'Message 3 秒后自动关闭，同时支持手动关闭。',
      showCloseButton: true,
      durationMs: 3000,
    });
  };

  const sendNotificationDefault = async () => {
    await sendAppNotify('notification', 'warning', {
      message: 'Notification 默认定时关闭（5 秒）。',
    });
  };

  const sendNotificationWithPermissionDetail = async () => {
    await sendAppNotify('notification', 'danger', {
      title: 'Permission Required',
      message: '点击查看详情并选择权限处理方式。',
      requestId: `perm-${Date.now()}`,
      detail: {
        title: '文件系统权限请求',
        content:
          '系统检测到当前操作需要文件系统权限。请选择允许、拒绝，或稍后再说。',
        mode: 'choice',
        choices: [
          { key: 'allow', label: '允许', variant: 'primary' },
          { key: 'deny', label: '拒绝', variant: 'danger' },
          { key: 'later', label: '稍后提醒', variant: 'default' },
        ],
      },
    });
  };

  const sendNotificationWithInfoDetail = async () => {
    await sendAppNotify('notification', 'info', {
      title: 'Release Note',
      message: '点击查看通知详情。',
      detail: {
        title: '更新说明',
        content:
          'v1.0.0: 优化了主进程启动链路，并新增应用内通知级别与可配置关闭策略。',
        mode: 'ack',
        confirmText: '知道了',
      },
    });
  };

  const sendSystemNotification = async () => {
    await notify.sendSystemNotification({
      title: 'Docs System Notification',
      body: 'This is a system-level notification test.',
    });
  };

  return {
    ...notify,
    sendMessageDefault,
    sendMessageTimed,
    sendNotificationDefault,
    sendNotificationWithPermissionDetail,
    sendNotificationWithInfoDetail,
    sendSystemNotification,
  };
}
