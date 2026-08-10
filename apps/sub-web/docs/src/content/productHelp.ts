import adminGettingStarted from '@/docs/product/admin-getting-started.md?raw';
import approvals from '@/docs/product/approvals.md?raw';
import connectResource from '@/docs/product/connect-resource.md?raw';
import consumerGettingStarted from '@/docs/product/consumer-getting-started.md?raw';
import consumerSignIn from '@/docs/product/consumer-sign-in.md?raw';
import findRequest from '@/docs/product/find-request.md?raw';
import pluginConfiguration from '@/docs/product/plugin-configuration.md?raw';
import providerGettingStarted from '@/docs/product/provider-getting-started.md?raw';
import publishResource from '@/docs/product/publish-resource.md?raw';
import settings from '@/docs/product/settings.md?raw';
import troubleshooting from '@/docs/product/troubleshooting.md?raw';
import componentGuidelines from '@/docs/reference/component-guidelines.md?raw';

export interface HelpDocument {
  id: string;
  title: string;
  description: string;
  audience: '开发者' | '提供方' | '消费者' | '管理员';
  path: string;
  updatedAt: string;
  source: string;
  keywords: string[];
}

export const HELP_VERSION = '0.0.0';
const updatedAt = '2026-07-26';

export const HELP_DOCUMENTS: readonly HelpDocument[] = [
  {
    id: 'consumer-getting-started',
    title: '消费者快速开始',
    description: '从登录到个人工作台和资源目录。',
    audience: '消费者',
    path: '/help/consumer/getting-started',
    updatedAt,
    source: consumerGettingStarted,
    keywords: ['登录', '工作台', '搜索'],
  },
  {
    id: 'consumer-sign-in',
    title: '登录、MFA 与账号恢复',
    description: '处理组织选择、多因素认证和会话问题。',
    audience: '消费者',
    path: '/help/consumer/sign-in',
    updatedAt,
    source: consumerSignIn,
    keywords: ['登录', 'MFA', '恢复', '会话'],
  },
  {
    id: 'find-request',
    title: '查找并申请资源',
    description: '搜索、理解并申请 API、库表或 Connector。',
    audience: '消费者',
    path: '/help/consumer/find-request',
    updatedAt,
    source: findRequest,
    keywords: ['目录', '申请', 'API', 'Connector'],
  },
  {
    id: 'connect-resource',
    title: '接入已获批资源',
    description: '获取地址、鉴权方式、示例与续期信息。',
    audience: '消费者',
    path: '/help/consumer/connect-resource',
    updatedAt,
    source: connectResource,
    keywords: ['接入', '凭证', '鉴权', '续期'],
  },
  {
    id: 'provider-getting-started',
    title: '提供方快速开始',
    description: '认识提供方工作台、服务和待办。',
    audience: '提供方',
    path: '/help/provider/getting-started',
    updatedAt,
    source: providerGettingStarted,
    keywords: ['提供方', '服务', '待办'],
  },
  {
    id: 'publish-resource',
    title: '发布资源与版本',
    description: '登记、验证、发布和回滚服务版本。',
    audience: '提供方',
    path: '/help/provider/publish',
    updatedAt,
    source: publishResource,
    keywords: ['发布', '版本', '回滚'],
  },
  {
    id: 'admin-getting-started',
    title: '管理员快速开始',
    description: '从治理工作台处理风险与异常。',
    audience: '管理员',
    path: '/help/admin/getting-started',
    updatedAt,
    source: adminGettingStarted,
    keywords: ['管理员', '治理', '异常'],
  },
  {
    id: 'approvals',
    title: '审批与风险判断',
    description: '审批访问、发布和插件启用申请。',
    audience: '管理员',
    path: '/help/admin/approvals',
    updatedAt,
    source: approvals,
    keywords: ['审批', '风险', '权限'],
  },
  {
    id: 'plugin-configuration',
    title: '插件安装与配置',
    description: '理解插件 Schema、测试和治理状态。',
    audience: '管理员',
    path: '/help/admin/plugin-configuration',
    updatedAt,
    source: pluginConfiguration,
    keywords: ['插件', 'Schema', 'DAG'],
  },
  {
    id: 'settings',
    title: 'Settings 治理',
    description: '管理成员、角色、权限、配置与审计。',
    audience: '管理员',
    path: '/help/admin/settings',
    updatedAt,
    source: settings,
    keywords: ['Settings', '角色', '权限', '审计'],
  },
  {
    id: 'troubleshooting',
    title: '故障排查',
    description: '处理无结果、无权限、网络和运行异常。',
    audience: '消费者',
    path: '/help/troubleshooting',
    updatedAt,
    source: troubleshooting,
    keywords: ['故障', '错误', '离线', '无权限'],
  },
  {
    id: 'component-guidelines',
    title: '组件使用规范',
    description: '可访问性、内容、键盘、响应式与组合模式。',
    audience: '开发者',
    path: '/reference/component-guidelines',
    updatedAt,
    source: componentGuidelines,
    keywords: ['组件', '可访问性', '键盘', '响应式'],
  },
] as const;

export function getHelpDocument(id: string): HelpDocument | undefined {
  return HELP_DOCUMENTS.find((document) => document.id === id);
}
