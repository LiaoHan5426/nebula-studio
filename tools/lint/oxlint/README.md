# @nebula-studio-internal/oxlint

**Oxlint 共享配置**：源码在 `src/`，通过 **`vp pack`** 产出到 **`dist/`**，供仓库根 [vite.config.ts](../../vite.config.ts) 的 `lint` 段与 **staged**（`vp check`）消费。

## 关键文件

| 路径 | 说明 |
| --- | --- |
| `src/index.ts` | `defineConfig` 包装与 re-export |
| `src/configs/tailwindcss.ts` | `better-tailwindcss` 的 `entryPoint`：用 `@nebula-studio-internal/node` 的 `getPackageSync` 解析 **`@nebula-studio-internal/tailwind`**，避免相对路径在包移动后断裂 |

## 脚本

| 脚本             | 说明                  |
| ---------------- | --------------------- |
| `stub` / `build` | `vp pack` 生成 `dist` |
| `check`          | `vp check` 自检       |

## 修改流程

1. 改 `src/**/*.ts` 后执行 **`vp pack`**（或依赖根 `postinstall` 的 stub 链）。
2. 根目录 **`pnpm run check`** 验证与根 `vite.config.ts` 合并结果。

## 相关

- [oxfmt README](../oxfmt/README.md) · [tailwind README](../../tailwindcss/README.md) · [Monorepo 索引](../../../docs/monorepo.md)
