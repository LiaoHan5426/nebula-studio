/**
 * @nebula-studio/contracts/integration
 *
 * 集成域权威类型定义汇总。
 */

export * from './subscription.js';
export * from './interface.js';
export * from './connector.js';
export * from './resource.js';
export * from './governance.js';
export * from './flow.js';
export * from './tenant.js';

// api-client 传输类型 re-export
export type { ApiResponse } from '@nebula-studio/api-client';
export { isApiSuccess } from '@nebula-studio/api-client';
export type {
  PageResponse,
  MybatisPage,
  PageResult,
} from '@nebula-studio/api-client';
