export const notifyApiRows = [
  {
    name: 'sendMessageDefault()',
    type: '() => Promise<void>',
    description: '发送默认消息通知，用于验证基础 message 流程。',
  },
  {
    name: 'sendMessageTimed()',
    type: '() => Promise<void>',
    description: '发送带超时参数的消息通知，验证自动关闭行为。',
  },
  {
    name: 'sendNotificationDefault()',
    type: '() => Promise<void>',
    description: '发送基础 notification 通知并展示默认操作。',
  },
  {
    name: 'sendNotificationWithPermissionDetail()',
    type: '() => Promise<void>',
    description: '发送权限相关 detail payload，验证 detail modal 交互。',
  },
  {
    name: 'sendNotificationWithInfoDetail()',
    type: '() => Promise<void>',
    description: '发送信息类 detail payload，验证日志返回与确认流程。',
  },
  {
    name: 'sendSystemNotification()',
    type: '() => Promise<void>',
    description: '触发系统通知桥接调用，验证桌面通知能力。',
  },
];
