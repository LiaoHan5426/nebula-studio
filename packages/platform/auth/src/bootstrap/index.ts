/**
 * @nebula-studio/auth
 *
 * 统一认证编排包。
 * 根据 RuntimeMode 自动选择认证策略（standalone / embed / electron），
 * 替代原本散落在 integration / app-shell / electron 各处的认证逻辑。
 */

export { AuthBootstrap } from './AuthBootstrap';
export type { AuthBootstrapOptions, AuthStrategy } from './types';
