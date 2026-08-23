# @nebula-studio/styles

**生产样式链**：Host/standalone 用 `@nebula-studio/styles/document`（含 Tailwind preflight）；Federation Remote 用 `@nebula-studio/styles/remote`（无 html preflight）。二者都会加载本包 `index.css` token/foundation 层，以及 `@nebula-studio-internal/tailwind/theme`。

Overlay 传送门样式在 `@nebula-studio/nebula-assembly` 的 `assembly.css`，不要再写进 document CSS。

**Electron 专用** 覆盖放在 **`apps/electron/src/renderer/styles/electron-overrides.css`**，在 `styles/document` 之后引入。

## 目录

| 路径               | 内容                          |
| ------------------ | ----------------------------- |
| `src/document.css` | Host preflight + 文档 reset   |
| `src/remote.css`   | 仅 Tailwind theme             |
| `src/tokens/`      | `:root` 尺寸/层级、明暗语义色 |
| `src/foundations/` | 滚动条、主题过渡、Web 密度    |
| `src/index.css`    | token/foundation `@import`    |

## 相关

- [tailwind README](../../tools/tailwindcss/README.md) · [types README](../types/README.md)
