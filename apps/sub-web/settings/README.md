# Settings 子应用独立启动

路径：`apps/sub-web/settings`

## 前置

仅需 platform-console `:8090`（组织/用户/配置/任务 API）。

## 启动

```powershell
# 在 nebula-studio 仓库根目录执行
vp run --filter @nebula-studio-renderer/settings dev
```

Host 壳层通过 Federation 加载 `./application`（`http://localhost:5177/mf-manifest.json`）。standalone 仍走 `src/boot.ts`；未登录时 `/login` 使用 `@nebula-studio/login-ui`，不依赖 Login renderer。

共享 `defineNebulaSubAppConfig()` 根据 `windows.json` 的 `standard` preset 自动生成 system/governance/version/release 代理。

## 验收

组织树 CRUD、用户管理、任务列表在仅启动 platform-console 时可完成全流程。
