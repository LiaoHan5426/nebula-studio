# @nebula-studio/styles

**全局设计链（纯 CSS）**：`tokens/`（语义色、`--font-family` 等）与 `foundations/`（滚动条、主题切换动效）。**不包含** Tailwind v4 的 `@theme` / `@source` / 插件注册。

## 在仓库中的位置

```
@nebula-studio-internal/tailwind  electron 入口
  → tools/tailwindcss/src/theme.css   （Tailwind v4 + @source）
  → tools/tailwindcss/src/electron.ts （第二行 import 本包）
  → 本包 src/index.css
```

**Electron 专用** 覆盖（窗口边框、原生控件等）放在 **`apps/electron/src/renderer/styles/electron-overrides.css`**，由 `boot.ts` 在 tailwind 链之后引入。

## 目录结构（恢复时对照）

| 目录               | 内容                                        |
| ------------------ | ------------------------------------------- |
| `src/tokens/`      | `:root` 尺寸/层级、明暗语义色与 50–700 色阶 |
| `src/foundations/` | 滚动条、主题过渡动画                        |
| `src/index.css`    | 聚合 `@import`                              |

新增组件时：

- **尺寸**：`var(--control-height-md)`（或 Tailwind `h-control`），不要再写 34px / 36px / 38px。
- **颜色**：只用语义 token（`--primary`、`--destructive`）或色阶（`--primary-50`）；不要硬编码 hex。
- **层级**：`--z-sticky` < `--z-nav` < `--z-overlay` < `--z-modal` < `--z-popover` < `--z-tooltip`。浮层禁止再用 `99999`。
- **防遮蔽**：下拉/菜单 Teleport + `useDropdownPosition`；对话框 `max-height` + 内部滚动；正文旁的 sticky 导航用预留栏而不是 `position: fixed` 盖住内容。

## `package.json` exports

仅 **CSS 路径**（无独立 TS 实现）；侧效 `import '@nebula-studio/styles'` 的类型声明在 **`@nebula-studio/types`**，勿在本包再维护重复 `.d.ts`（除非未来改为带类型的构建产物）。

## 相关

- [tailwind README](../../tools/tailwindcss/README.md) · [types README](../types/README.md) · [Monorepo 索引](../../docs/monorepo.md)
