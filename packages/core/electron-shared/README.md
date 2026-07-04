# @nebula-studio-electron/electron-shared

**主进程与 preload 共用**的类型、常量与 IPC 载荷定义。**无 Vue**、无 DOM。

## 消费方

- `apps/electron`（主进程）
- `apps/electron-preload/*`
- `packages/electron-shared-vue`（仅类型/常量引用，不反向依赖主进程实现文件）

## 迁移注意

- 修改 **IPC channel 名或载荷形状** 时：同步 **preload `contextBridge`**、**主进程 handler**、以及 **`electron-shared-vue`** 中暴露给 renderer 的封装。

## 相关

- [electron-shared-vue README](../electron-shared-vue/README.md) · [Monorepo 索引](../../docs/monorepo.md)
