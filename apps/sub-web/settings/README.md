# Settings 子应用独立启动

路径：`J:/Code/nebula-workspace/nebula-studio/apps/sub-web/settings`

## 前置

仅需 platform-console `:8090`（组织/用户/配置/任务 API）。

## 启动

```powershell
cd J:/Code/nebula-workspace/nebula-studio
vp run --filter @nebula-studio-renderer/settings dev
```

`vite.proxy.ts` 使用 `standardApiProxy()`：system/governance/version/release → `:8090`。

## 验收

组织树 CRUD、用户管理、任务列表在仅启动 platform-console 时可完成全流程。
