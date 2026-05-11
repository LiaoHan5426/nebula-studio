/**
 * 与各 renderer 约定一致：供 `installWebPresentation` / 文档壳等读取 Node 版本展示。
 */
export function nebulaBuildNodeVersionDefine(): Record<string, string> {
  const buildNodeVersion = process.version.replace(/^v/, '');
  return {
    __NEBULA_BUILD_NODE_VERSION__: JSON.stringify(buildNodeVersion),
  };
}
