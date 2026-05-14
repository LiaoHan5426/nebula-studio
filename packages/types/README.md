# @nebula-studio/types

**Ambient 类型包**：通过 **`@nebula-studio-internal/tsconfig/web.json`** 的 `compilerOptions.types` 注入到各 renderer / 工具包，**无运行时模块**。

## 本包维护的内容（单一事实来源）

| 声明 | 用途 |
| --- | --- |
| `declare const __NEBULA_BUILD_NODE_VERSION__` | 与 `@nebula-studio-internal/vite` 的 `nebulaBuildNodeVersionDefine()` 一致 |
| `declare module '@nebula-studio-internal/tailwind/electron'` | 侧效样式链入口 |
| `declare module '@nebula-studio/styles'` | 侧效设计 CSS 包 |
| `declare module '@wangeditor/editor-for-vue'` | 上游缺 `types` 时的最小补全 |

## 禁止 / 避免

- **勿**在各应用 `env.d.ts` 重复以上声明（会导致发散与合并冲突）。
- 各应用 `env.d.ts` **仅保留**：`Window`、`api`、preload 等与 **该应用形态** 绑定的 `declare global`。
- **勿**在本文件加 `import` / `export` 顶层语句（会变成模块，破坏 ambient 行为）；保持 **纯三斜线 + declare** 风格（当前无 `export {}`）。

## 消费方式

子包 `tsconfig` 应 `extends` **web** preset，且在 `package.json` 中声明依赖 `"@nebula-studio/types": "workspace:^"`，以便 pnpm 安装且 TypeScript 能解析 `compilerOptions.types` 中的包名。

## 相关

- [tsconfig preset](../../tools/tsconfig/README.md) · [Monorepo 索引](../../docs/monorepo.md)
