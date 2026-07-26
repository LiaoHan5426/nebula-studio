export interface HelpTopic {
  key: string;
  path: string;
  title: string;
}

const DEFAULT_HELP_TOPIC: HelpTopic = {
  key: 'shell.workspace',
  path: '/help/consumer/getting-started',
  title: '个人工作台快速开始',
};

export const HELP_TOPICS: readonly HelpTopic[] = [
  DEFAULT_HELP_TOPIC,
  {
    key: 'login',
    path: '/help/consumer/sign-in',
    title: '登录、MFA 与账号恢复',
  },
  {
    key: 'integration.resource-catalog',
    path: '/help/consumer/find-request',
    title: '查找并申请资源',
  },
  {
    key: 'integration.resource-detail',
    path: '/help/consumer/find-request',
    title: '理解资源详情',
  },
  {
    key: 'integration.access-request',
    path: '/help/consumer/find-request',
    title: '提交资源申请',
  },
  {
    key: 'integration.my-requests',
    path: '/help/consumer/find-request',
    title: '跟踪申请进度',
  },
  {
    key: 'integration.my-resources',
    path: '/help/consumer/connect-resource',
    title: '接入已获批资源',
  },
  {
    key: 'integration.service-publish',
    path: '/help/provider/publish',
    title: '发布资源与版本',
  },
  {
    key: 'integration.service-approvals',
    path: '/help/admin/approvals',
    title: '审批与风险判断',
  },
  {
    key: 'integration.plugin-market',
    path: '/help/admin/plugin-configuration',
    title: '插件安装与配置',
  },
  {
    key: 'integration.manage-plugins',
    path: '/help/admin/plugin-configuration',
    title: '插件治理',
  },
  {
    key: 'integration.provider-home',
    path: '/help/provider/getting-started',
    title: '提供方工作台',
  },
  {
    key: 'integration.management-home',
    path: '/help/admin/getting-started',
    title: '管理员治理工作台',
  },
  {
    key: 'settings.',
    path: '/help/admin/settings',
    title: '设置、成员与访问控制',
  },
  { key: 'docs.', path: '/help', title: '帮助中心' },
] as const;

export function resolveHelpTopic(helpKey?: string | null): HelpTopic {
  if (!helpKey) return DEFAULT_HELP_TOPIC;
  return (
    HELP_TOPICS.find((topic) => topic.key === helpKey) ??
    HELP_TOPICS.find(
      (topic) => topic.key.endsWith('.') && helpKey.startsWith(topic.key),
    ) ??
    DEFAULT_HELP_TOPIC
  );
}

export type TaskGuideId = 'first-login' | 'first-request' | 'first-publish';

export interface TaskGuide {
  id: TaskGuideId;
  title: string;
  description: string;
  helpPath: string;
  action?: { viewId: string; path: string };
}

export const TASK_GUIDES: readonly TaskGuide[] = [
  {
    id: 'first-login',
    title: '首次登录与工作台',
    description: '确认组织、认识个人工作台，并了解全局搜索和恢复入口。',
    helpPath: '/help/consumer/getting-started',
  },
  {
    id: 'first-request',
    title: '首次资源申请',
    description: '查找资源、理解申请范围，并在提交前核对用途与期限。',
    helpPath: '/help/consumer/find-request',
    action: { viewId: 'integration', path: '/catalog' },
  },
  {
    id: 'first-publish',
    title: '首次资源发布',
    description: '登记服务、准备版本并完成发布前检查。',
    helpPath: '/help/provider/publish',
    action: { viewId: 'integration', path: '/provider/publish' },
  },
] as const;

export const TASK_GUIDE_STORAGE_KEY = 'nebula.task-guides.v1';

export function readTaskGuideState(
  storage: Pick<Storage, 'getItem'>,
): Record<TaskGuideId, boolean> {
  try {
    const value = JSON.parse(
      storage.getItem(TASK_GUIDE_STORAGE_KEY) ?? '{}',
    ) as Partial<Record<TaskGuideId, boolean>>;
    return {
      'first-login': value['first-login'] === true,
      'first-request': value['first-request'] === true,
      'first-publish': value['first-publish'] === true,
    };
  } catch {
    return {
      'first-login': false,
      'first-request': false,
      'first-publish': false,
    };
  }
}

export function writeTaskGuideState(
  storage: Pick<Storage, 'setItem'>,
  state: Record<TaskGuideId, boolean>,
): void {
  storage.setItem(TASK_GUIDE_STORAGE_KEY, JSON.stringify(state));
}
