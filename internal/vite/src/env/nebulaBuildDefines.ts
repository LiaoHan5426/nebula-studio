/**
 * 与各 renderer 约定一致：供 `installWebPresentation` / 文档壳等读取 Node 版本展示。
 */
export function nebulaBuildNodeVersionDefine(): Record<string, string> {
  const buildNodeVersion = process.version.replace(/^v/, '');
  return {
    __NEBULA_BUILD_NODE_VERSION__: JSON.stringify(buildNodeVersion),
  };
}

/**
 * MSW Mock 开关：仅 GitHub demo 部署时启用。
 *
 * 读取 `NEBULA_MSW_ENABLED` 环境变量（非 Vite 前缀，避免客户端暴露），
 * 构建时静态替换 `__NEBULA_MSW_ENABLED__` 为布尔字面量，
 * Rollup 自动剔除 `if (false) { ... }` 死代码，MSW 不会进入生产包。
 */
export function nebulaMswDefine(): Record<string, boolean | string> {
  const enabled = process.env.NEBULA_MSW_ENABLED === 'true';
  return {
    __NEBULA_MSW_ENABLED__: enabled,
    __NEBULA_MSW_BASE_PATH__: JSON.stringify(
      process.env.NEBULA_MSW_BASE_PATH || '/',
    ),
  };
}
