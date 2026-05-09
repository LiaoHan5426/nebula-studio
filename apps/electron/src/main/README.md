### Main 模块化（已按步骤落地）

1. 启动链路（链式启动器）
   - `bootstrap/MainAppLauncher.ts` 提供 `.use(module)` + `launch()`，按顺序执行模块。
2. 窗口管理器 `WindowManager`
   - 抽离 `BrowserWindow + BrowserView` 创建与布局逻辑。
3. 窗口状态管理器 `WindowStateManager`
   - 通过 `ConfigManager` 持久化主窗口尺寸（`resize` 时自动保存）。
4. 单实例模块 `SingleInstanceApp`
   - 检测二次启动并聚焦已有窗口。
5. IPC 通知模块 `IpcNotification`
   - 预留 `notify:app`（`message` / `notification` + `success`/`info`/`warning`/`danger`）与 `notify:system` 两类能力。
   - `notify:app` 支持 `showCloseButton`、`durationMs`、`detail`（可点击详情）与 `requestId` 响应回调。
   - 子应用（如 `docs`）preload 通过 `notify:bridge:*` 桥接，主 preload 走 `notify:*` 直连；日志记录包含 `source`（应用标识）。
   - `source` 为字符串（如 `main` / `docs`），并在主进程按 `app.config.windows` 校验是否存在对应应用。
6. 自动更新模块 `AutoUpdater`
   - 先提供可插拔占位，后续可接入 `electron-updater`。
7. 关闭策略模块 `ApplicationTerminatorOnLastWindowClose`
   - 非 macOS 下最后窗口关闭时退出应用。
8. 安全模块 `BlockNotAllowedOrigins`
   - 限制导航来源。
9. `ApplicationLogger`
   - 统一主进程日志输出入口（已支持落盘）。
   - 日志目录优先级（开发）：`NEBULA_LOG_DIR` > `ConfigManager.log.dir` > `app.getAppPath()/public/logs`（默认）> `userData/logs`。
   - 日志目录优先级（打包）：安装目录同级 `logs` > `resources` 同级 `logs` > `NEBULA_LOG_DIR` > `ConfigManager.log.dir` > `userData/logs`。
10. `ConfigManager`
    - 统一配置读写：开发环境使用 `apps/electron/public/config/nebula.config.yaml`，打包后使用安装目录下 `config/nebula.config.yaml`。
    - 支持 `log.dir` 持久化配置，可用于指定日志目录。
11. `RuntimePluginManager`
    - 运行期插件注册与统一启动入口。
12. 开发期热更新防踩坑（main / preload）
    - `electron-vite` 默认只会首编译一次；若未开启 watch，修改 `apps/electron/src/main/**` 或 `apps/electron-preload/**` 不会触发 Electron 重启。
    - 必须在 `apps/electron/electron.vite.config.ts` 显式开启：
      - `main.build.watch = {}`
      - `preload.build.watch = {}`
    - 生效后的终端特征日志：
      - `electron main process rebuilt successfully`
      - `restarting electron app...`
