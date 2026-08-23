# @nebula-studio/login-ui

Host 与 Settings/Integration standalone 共用的登录界面。不依赖 Login renderer 包，也不进入 Federation Remote 图。

## 入口

默认导出 Vue 根组件。Host：`apps/web/src/auth/bootHostLogin.ts`。standalone：Settings/Integration 的 `/login` 路由。Login renderer 的 `boot.ts` 仅用于本包独立 `vite dev`。
