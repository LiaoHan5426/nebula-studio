# @nebula-studio-electron/electron-bridge

Electron 主进程、preload 与 renderer 共用的桥接类型、常量、IPC 载荷和 Vue 适配。

## 消费方

- `apps/electron`（主进程）
- `apps/electron-preload/src`
- renderer 与壳层（通过 `@nebula-studio-electron/electron-bridge/vue` 使用 Vue 适配）

## 迁移注意

- 修改 **IPC channel 名或载荷形状** 时：同步 preload `contextBridge`、主进程 handler，以及本包 `./vue` 子路径暴露给 renderer 的封装。

## 相关

- [Monorepo 索引](../../../docs/monorepo.md) · [Electron README](../../../apps/electron/README.md)
