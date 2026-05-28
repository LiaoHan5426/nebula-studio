# @nebula-studio/nebula-ui

**Vue 组件库**（表格、分页、编辑器、主题切换等）。样式与第三方组件的全局 patch 在 **`src/styles.css`**（由包入口引用）。组件在 **`src/components/`**（kebab-case 目录、无 `nebula-` 前缀），由 **[`src/components/index.ts`](./src/components/index.ts)** 统一再导出；说明见 [components README](./src/components/README.md)。

## 消费方

各 `@nebula-studio-renderer/*`、`apps/web` embed 等。

## 与全局主题的关系

- 组件使用 **语义 CSS 变量**（如 `hsl(var(--card))`），须与 **`@nebula-studio-internal/tailwind/electron`** 引入的全局链同页加载。
- **勿**在本包内重复定义 `:root` / `html.dark` 语义色（归属 **`@nebula-studio/styles`**）。

## 脚本

见 [package.json](./package.json)。

## 相关

- [styles README](../styles/README.md) · [tailwind 工具 README](../../tools/tailwindcss/README.md) · [types README](../types/README.md)
