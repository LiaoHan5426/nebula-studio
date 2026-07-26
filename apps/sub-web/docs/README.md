# @nebula-studio-renderer/docs

Nebula UI 的组件文档子应用，提供组件指南、交互示例和主题说明。它既可以独立启动，也可以由 Web 或 Electron 宿主加载。

## 运行方式

在 `nebula-studio` 仓库根目录执行：

```powershell
vp run --filter @nebula-studio-renderer/docs dev
```

具体端口以 Vite 启动输出为准。

## 主要入口

| 路径          | 说明                      |
| ------------- | ------------------------- |
| `src/main.ts` | 独立运行入口              |
| `src/boot.ts` | Web/Electron 宿主启动入口 |
| `src/App.vue` | 文档应用根组件            |
| `src/docs`    | 指南、组件说明和示例内容  |

## 维护约定

- 新增或修改公共 UI 组件时，同步更新 `src/docs` 中的说明和可运行示例。
- 窗口与宿主信息来自仓库根目录的 `configs/windows.json`，不要在本文档中复制配置。
- Electron 能力由统一 preload 按窗口 capability 提供，不创建 Docs 专属 preload 包。

## 相关文档

- [应用说明](../../../docs/applications.md)
- [Monorepo 索引](../../../docs/monorepo.md)
- [开发约定](../../../docs/development.md)
