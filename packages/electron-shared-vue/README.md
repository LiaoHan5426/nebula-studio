# @nebula-studio-electron/electron-shared-vue

**渲染进程（Vue）** 与 Electron 壳之间的共享逻辑：`ConfigProvider`、主题/语言同步、通知桥、`window.api` 相关 composable 等。

## 消费方

所有 `@nebula-studio-renderer/*` 子应用及文档站。

## 边界

- **可**依赖 `vue`、`@nebula-studio-electron/electron-shared`。
- **勿**依赖 `apps/electron` 主进程源码；需要主进程能力时通过 **preload 已暴露** 的 API。

## 相关

- [electron-shared README](../electron-shared/README.md) · [app-shell README](../app-shell/README.md) · [Monorepo 索引](../../docs/monorepo.md)
