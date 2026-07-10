# Integration 子应用独立启动

路径：`J:/Code/nebula-workspace/nebula-studio/apps/sub-web/integration`

## 前置

- platform-console `:8090`（治理/版本/发布/系统 API）
- demo-camel-console `:8080`、demo-camel-executor `:8081`（Camel 运行时）

## 启动

```powershell
cd J:/Code/nebula-workspace/nebula-studio
vp run --filter @nebula-studio-renderer/integration dev
```

访问 http://localhost:5174 。代理见 `vite.proxy.ts`（platform → 8090，executor → 8081）。

## MSW

设置 `VITE_MSW=true` 可启用 Mock（部分 API）。
