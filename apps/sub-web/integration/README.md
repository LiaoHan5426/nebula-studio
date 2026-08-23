# Integration 子应用独立启动

路径：`apps/sub-web/integration`

## 前置

- platform-console `:8090`（治理/版本/发布/系统 API）
- demo-camel-console `:8080`、demo-camel-executor `:8081`（Camel 运行时）

## 启动

```powershell
# 在 nebula-studio 仓库根目录执行
vp run --filter @nebula-studio-renderer/integration dev
```

访问 http://localhost:5174 。代理由共享 `defineNebulaSubAppConfig()` 根据 `windows.json` 的 `integration` preset 自动生成。

Host 壳层通过 Federation 加载 `./application`（`http://localhost:5174/mf-manifest.json`）。standalone 仍走 `src/boot.ts`；未登录时路由到 `/login`，**复用 `@nebula-studio/login-ui`**，不依赖 Login renderer 包。Host 嵌入不走这条路由，由壳层 `/?embed=login` 负责。

## MSW

设置 `VITE_MSW=true` 可启用 Mock（部分 API）。
