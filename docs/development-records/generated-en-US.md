# Nebula Studio Development Record

> Range: `9b0d758b7e321966c69236cc50450419e9135fca HEAD`

## Summary

### Changeset-style summary

- 工程维护：3 项变更 (.vscode, 3 commits)
- 架构与重构：8 项变更 (cross-cutting, 8 commits)
- 功能开发：25 项变更 (cross-cutting, 25 commits)
- update .npmrc to enable npm registry for package management (.npmrc, 1 commit)
- 工程维护：2 项变更 (.gitignore, 2 commits)
- 工程维护：16 项变更 (cross-cutting, 16 commits)
- 缺陷修复：4 项变更 (cross-cutting, 4 commits)
- replace highlighter utility and clean up styles (docs, 1 commit)
- 工程维护：5 项变更 (.github, 5 commits)
- 工程维护：4 项变更 (electron, 4 commits)
- 缺陷修复：3 项变更 (tooling, 3 commits)
- 完成 Platform 真实栈与严格契约验收 (cross-cutting, 1 commit)
- update AGENTS.md for improved clarity and localization (.hermes.md, 1 commit)
- 缺陷修复：3 项变更 (pnpm-lock.yaml, 3 commits)
- update documentation for testing commands and backend integration (README.md, 1 commit)
- 功能开发：3 项变更 (integration, 3 commits)
- 工程维护：12 项变更 (deps, 12 commits)
- 架构与重构：2 项变更 (internal/vite, 2 commits)
- enhance error handling and improve data loading logic (integration, 1 commit)
- rewrite and expand project documentation (docs, 1 commit)
- 更新 README.md 文件以增强文档清晰度和结构 (README.md, 1 commit)
- update README files for clarity and structure (integration, settings, 1 commit)
- enhance platform and service navigation with new routes and menu items (navigation, 1 commit)
- 重构别名插件实现 (vite, 1 commit)
- 功能开发：2 项变更 (docs, 2 commits)
- 添加 MSW 模拟服务支持 (login, 1 commit)
- 集成 nebula-layout 组件库并优化样式引入 (layout, 1 commit)
- 更新upload-pages-artifact到v5版本 (github actions, 1 commit)
- 适配子路径部署的MSW服务路径配置 (msw, 1 commit)
- 调整docs站点构建命令和工作目录 (github-actions, 1 commit)
- 优化部署脚本和gitignore配置 (.github, 1 commit)
- add extract-zip dependency and simplify dts config (electron, 1 commit)
- 修复VitePress base路径配置以支持GitHub Pages部署 (.github, 1 commit)
- 修复编辑器就绪事件触发问题 (rich-editor, 1 commit)
- 实现 NebulaDialog 和 NebulaInput 组件并替换 window.prompt (ui, 1 commit)
- 重构嵌入窗口管理和界面布局 (shell, 1 commit)
- 修复应用停靠组件网格视图ID双向绑定问题 (shell, 1 commit)
- 重构前端应用壳层实现 (frontend, 1 commit)
- 统一子应用启动入口并集成运行时 (renderer, 1 commit)
- 重构认证系统并统一多平台认证策略 (auth, 1 commit)
- 新增 runtime 包并重构子应用启动逻辑 (runtime, 1 commit)
- 迁移测试文件并更新配置 (integration, 1 commit)
- 移除重复的 baseUrl 配置并优化代码结构 (config, 1 commit)
- 重构集成应用依赖和API结构 (integration, 1 commit)
- 架构与重构：2 项变更 (electron, 2 commits)
- 更新 TypeScript 配置以支持新集成文件 (tsconfig, 1 commit)
- 更新配置文件和依赖设置 (config, 1 commit)
- remove .trae directory (should not be committed) (.trae, 1 commit)
- 清理不必要的Python和编辑器缓存忽略规则 (gitignore, 1 commit)
- 更新 .gitignore 和 AGENTS.md，添加 Git 提交信息规范 (tooling, 1 commit)
- 缺陷修复：2 项变更 (ci, 2 commits)
- 重构文档站点为多页面架构，新增前后端文档首页 (sub-web/docs, 1 commit)
- 功能开发：3 项变更 (.github, 3 commits)
- 功能开发：7 项变更 (electron, 7 commits)
- introduce custom ESLint configuration and dependencies (lint, 1 commit)
- 功能开发：2 项变更 (cspell.json, 2 commits)
- 迁移 .cursor/rules 规则文件到 agent-skills 目录 (.github, 1 commit)
- 其他：3 项变更 (docs, 3 commits)
- refine styles and configurations across components (docs, 1 commit)
- update package versions in configuration files (package.json, 1 commit)
- preserve tailwind theme styles in docs web build (.gitignore, 1 commit)
- add demo component and remove unused pdm .gitignore (apps, 1 commit)
- enhance test imports and improve build script error handling (tooling, 1 commit)
- update .npmrc and pnpm-workspace.yaml for improved configuration (.npmrc, 1 commit)
- implement abstract security module and block disallowed origins (security, 1 commit)
- update VS Code extensions recommendations and refine linting configurations (.vscode, 1 commit)
- update pnpm workspace and add stylelint configuration (.editorconfig, 1 commit)

Recorded commits: 158

Changes by category: Maintenance: 50, Refactoring: 23, Features: 55, Fixes: 18, Tests & quality: 2, Documentation: 2, Other: 4, CI: 2, Build & dependencies: 2

Most affected modules: cross-cutting: 54, electron: 14, deps: 12, .github: 11, docs: 8, integration: 6, tooling: 5, .vscode: 4

## Period: 2026-08

### Maintenance

- **.vscode** update ESLint configuration comments for clarity — 2026-08-24 — commit `001fa06`
- **.gitignore** update .gitignore to exclude Module Federation cache files — 2026-08-23 — commit `476f35a`
- **cross-cutting** remove outdated diagnostics JSON files for type declaration errors — 2026-08-23 — commit `08774c2`
- **cross-cutting** update diagnostics JSON files for type declaration errors — 2026-08-23 — commit `bdc3d9e`
- **cross-cutting** update vxe-pc-ui version and adjust UI theme — 2026-08-19 — commit `003dca8`
- **cross-cutting** update dependencies and configuration across multiple files — 2026-08-19 — commit `0efdef3`
- **cross-cutting** update vxe-table and tailwind-merge versions in lock and workspace files — 2026-08-19 — commit `6997817`
- **cross-cutting** enhance dialog components and update dependencies — 2026-08-19 — commit `c9b0878`
- **cross-cutting** update dependencies and refactor project structure — 2026-08-19 — commit `b329404`
- **cross-cutting** update styles and improve component configurations — 2026-08-18 — commit `2ceb0a0`
- **.github** update dependency versions in pnpm-lock.yaml and pnpm-workspace.yaml — 2026-08-18 — commit `89fb5e4`
- **cross-cutting** update project configuration and dependencies — 2026-08-10 — commit `9d4aa6a`
- **electron** update dependencies and remove unused scripts — 2026-08-07 — commit `414f28b`

### Refactoring

- **cross-cutting** improve Vue component formatting and enhance error handling — 2026-08-24 — commit `b4f8ef0`
- **cross-cutting** remove frontend and login applications to streamline project structure — 2026-08-23 — commit `9c8e866`
- **cross-cutting** update API namespaces and remove deprecated proxy configurations — 2026-08-22 — commit `88f0d8d`
- **cross-cutting** update API targets and integration configurations — 2026-08-19 — commit `ba19649`
- **docs** replace highlighter utility and clean up styles — 2026-08-19 — commit `4c61a4a`
- **cross-cutting** replace detectRuntimeMode with getResolvedRuntimeMode and enhance layout host mode handling — 2026-08-19 — commit `b4820e0`

### Features

- **cross-cutting** add federation development support and enhance remote configuration — 2026-08-24 — commit `2c09e56`
- **cross-cutting** enhance documentation and improve UI components across sub-web — 2026-08-23 — commit `1f7ed0a`
- **cross-cutting** update build configurations and enhance dependency management — 2026-08-23 — commit `a45703c`
- **cross-cutting** enhance development commands and improve CSS namespace handling — 2026-08-23 — commit `2095151`
- **cross-cutting** enhance theme management and update dependencies for improved integration — 2026-08-23 — commit `b30ee39`
- **cross-cutting** update dependencies and enhance code structure across multiple components — 2026-08-23 — commit `55e2c84`
- **cross-cutting** enhance package.json scripts and update dependencies for improved modularity — 2026-08-23 — commit `3b4f54d`
- **cross-cutting** add Tailwind CSS source isolation checks and update CI workflows — 2026-08-23 — commit `6e30d83`
- **cross-cutting** enhance Electron app configuration and integrate federation features — 2026-08-23 — commit `c93b713`
- **cross-cutting** integrate workspace summary and enhance management metrics — 2026-08-19 — commit `20f5f9d`

### Fixes

- **.npmrc** update .npmrc to enable npm registry for package management — 2026-08-24 — commit `36368ed`
- **cross-cutting** update diagnostics JSON files and API specifications — 2026-08-23 — commit `daa4ab2`
- **tooling** 约束真实栈进程祖先身份 (translation pending) — 2026-08-01 — commit `d05637e`
- **tooling** 加固真实栈进程身份围栏 (translation pending) — 2026-08-01 — commit `9ab8e06`
- **tooling** 完善真实栈进程树清理 (translation pending) — 2026-08-01 — commit `e9d522a`

### Tests & quality

- **cross-cutting** 完成 Platform 真实栈与严格契约验收 (translation pending) — 2026-08-01 — commit `81bbe38`

### Documentation

- **.hermes.md** update AGENTS.md for improved clarity and localization — 2026-08-01 — commit `5a36a7e`

## Period: 2026-07

### Fixes

- **pnpm-lock.yaml** update pnpm-lock.yaml for vitest versioning consistency — 2026-07-28 — commit `cfbaf73`
- **integration** enhance error handling and improve data loading logic — 2026-07-18 — commit `f37d109`
- **.github** fixVitePress base路径configuration以supportGitHub Pages部署 — 2026-07-04 — commit `85a3136`
- **cross-cutting** fixInputcomponentv-model绑定和登录错误提示问题 — 2026-07-04 — commit `0fc09c1`
- **rich-editor** fix编辑器就绪事件触发问题 — 2026-07-04 — commit `d09fbd3`
- **cross-cutting** 统一使用 nebula-ui component并fix lint 问题 — 2026-07-04 — commit `612a930`

### Features

- **README.md** update documentation for testing commands and backend integration — 2026-07-27 — commit `eff746b`
- **cross-cutting** enhance Playwright configuration and testing structure — 2026-07-26 — commit `0509285`
- **cross-cutting** enhance package.json scripts and update dependencies for code editor — 2026-07-26 — commit `1231a22`
- **cross-cutting** enhance documentation structure and navigation for product help — 2026-07-26 — commit `7abd1db`
- **cross-cutting** update navigation and routing for provider and management features — 2026-07-26 — commit `74b5048`
- **integration** update navigation and routing for resource catalog — 2026-07-26 — commit `acf028e`
- **cross-cutting** enhance App.vue and integratedApps.ts with new features and improved structure — 2026-07-26 — commit `fc4998b`
- **cross-cutting** integrate Nebula layout components and enhance routing structure — 2026-07-26 — commit `e25d1d3`
- **cross-cutting** enhance project capabilities and improve authentication structure — 2026-07-26 — commit `69c33f9`
- **navigation** enhance platform and service navigation with new routes and menu items — 2026-07-10 — commit `71b28b3`
- **docs** refactordocumentation站点并update代理configuration — 2026-07-06 — commit `88f7104`
- **login** 添加 MSW 模拟服务support — 2026-07-04 — commit `951b33f`
- **layout** 集成 nebula-layout component库并improve样式引入 — 2026-07-04 — commit `01902ea`
- **msw** 适配子路径部署的MSW服务路径configuration — 2026-07-04 — commit `9e84d93`
- **ui** 实现 NebulaDialog 和 NebulaInput component并替换 window.prompt — 2026-07-04 — commit `6026396`

### Maintenance

- **cross-cutting** update package.json files with descriptions, authors, licenses, and repository information — 2026-07-26 — commit `2a276b6`
- **deps** update package versions in pnpm-lock.yaml and pnpm-workspace.yaml — 2026-07-26 — commit `5e22df1`
- **deps** update package versions and enhance authentication structure — 2026-07-20 — commit `92a338d`
- **cross-cutting** 完成项目大规模refactor与清理 — 2026-07-15 — commit `a133a1e`
- **deps** update package versions in pnpm-lock.yaml — 2026-07-14 — commit `e0b0a56`
- **deps** update package versions in package.json and pnpm-lock.yaml — 2026-07-10 — commit `6da66e3`
- **deps** updatedependency并refactordocumentation站点configuration — 2026-07-06 — commit `e4afe69`
- **deps** updatedependency包版本并调整configuration — 2026-07-06 — commit `9bf52bb`
- **deps** 添加 msw 工作区dependency — 2026-07-04 — commit `5ef6be6`
- **deps** updatedependency包版本并improve工作流configuration — 2026-07-04 — commit `db8c0ce`
- **deps** updatedependency包并调整目录结构 — 2026-07-04 — commit `1ac1d64`

### Refactoring

- **internal/vite** improve function formatting and enhance proxy configuration — 2026-07-19 — commit `5296d41`
- **cross-cutting** 完成代码编辑器与插件安装器模块的移除与refactor — 2026-07-18 — commit `ed5db84`
- **integration, settings** update README files for clarity and structure — 2026-07-10 — commit `642a35e`
- **internal/vite** remove unused renderer sources exports — 2026-07-10 — commit `6eba9ac`
- **vite** refactor别名插件实现 — 2026-07-06 — commit `a5a62b7`
- **shell** refactor嵌入窗口管理和界面布局 — 2026-07-01 — commit `bfe1cdd`

### Documentation

- **docs** rewrite and expand project documentation — 2026-07-14 — commit `c406bf2`

### Other

- **README.md** update README.md 文件以增强documentation清晰度和结构 — 2026-07-14 — commit `6cd2518`

### CI

- **github actions** updateupload-pages-artifact到v5版本 — 2026-07-04 — commit `bebcaaf`
- **github-actions** 调整docs站点构建命令和工作目录 (translation pending) — 2026-07-04 — commit `d96329e`

### Build & dependencies

- **.github** improve部署脚本和gitignoreconfiguration — 2026-07-04 — commit `e96a963`
- **electron** add extract-zip dependency and simplify dts config — 2026-07-04 — commit `4b4ff12`

## Period: 2026-06

### Features

- **integration** 添加服务治理功能模块 (translation pending) — 2026-06-30 — commit `0d6edf4`
- **auth** refactor认证系统并统一多平台认证策略 — 2026-06-29 — commit `1f87d29`
- **runtime** add runtime 包并refactor子应用startup逻辑 — 2026-06-29 — commit `3088380`
- **cross-cutting** update PowerShell 工作流和 Vite+ documentation，增强集成平台功能 — 2026-06-21 — commit `c386a4d`
- **cross-cutting** update集成平台和代理configuration，improvedocumentation和component结构 — 2026-06-19 — commit `b07cfa7`
- **integration** update集成平台，add管理端和用户端功能 — 2026-06-18 — commit `724f021`
- **cross-cutting** 完善集成平台功能，add连接器、数据源和流程管理页面 — 2026-06-18 — commit `474c3bc`
- **cross-cutting** add集成平台模块，包含库表订阅、接口管理等功能 — 2026-06-17 — commit `6300a00`
- **docs** 移除 SQL Agent 相关documentation和component — 2026-06-06 — commit `89c922c`
- **.github** 添加 RTK CLI 指令documentation并移除旧的 hooks configuration — 2026-06-05 — commit `64017e0`
- **electron** update shell-viewport 事件，support传递 x 坐标和宽度 — 2026-06-04 — commit `757bfcb`
- **lint** introduce custom ESLint configuration and dependencies — 2026-06-04 — commit `86e2d6f`
- **.github** update Vite+ documentation，添加前置条件和决策流程；add RTK 指令documentation；添加 hooks configuration文件 — 2026-06-04 — commit `21e458b`
- **electron** update主窗口尺寸并improve侧边栏布局 — 2026-06-03 — commit `5e9e020`
- **cspell.json** update cspell 词汇表，添加新词并修改 pnpm configuration — 2026-06-03 — commit `b0393f1`
- **cspell.json** 添加 "wujie" 到 cspell 词汇表并update package.json 的 schema — 2026-06-03 — commit `d4feedb`

### Maintenance

- **deps** updatedependency包版本 — 2026-06-30 — commit `47e7db1`
- **deps** updatedependency项版本并添加 contracts 包引用 — 2026-06-29 — commit `2b5a6fb`
- **config** updateconfiguration文件和dependency设置 — 2026-06-25 — commit `4f2ff7b`
- **deps** updatedependency包版本并添加新忽略文件 — 2026-06-25 — commit `905ec24`
- **.gitignore** add .trae directory to gitignore — 2026-06-24 — commit `c5141fc`
- **.trae** remove .trae directory (should not be committed) — 2026-06-23 — commit `a16d13e`
- **gitignore** 清理不必要的Python和编辑器缓存忽略规则 (translation pending) — 2026-06-22 — commit `ef53e03`
- **tooling** update .gitignore 和 AGENTS.md，添加 Git 提交信息规范 — 2026-06-22 — commit `b95fff2`
- **cross-cutting** updatedocumentation和代码结构 — 2026-06-12 — commit `f87627d`
- **cross-cutting** update pnpm workspace configuration and dependencies — 2026-06-03 — commit `f29513e`

### Fixes

- **shell** fix应用停靠component网格视图ID双向绑定问题 — 2026-06-30 — commit `340404e`
- **ci** upgrade Pages workflow actions and add settings LogsPage — 2026-06-21 — commit `7d72983`
- **ci** upgrade Pages workflow actions and add settings LogsPage — 2026-06-21 — commit `c6a019f`
- **pnpm-lock.yaml** repair pnpm-lock.yaml after merge duplicate keys — 2026-06-21 — commit `35066ed`
- **pnpm-lock.yaml** repair pnpm-lock.yaml after merge duplicate keys — 2026-06-21 — commit `19933ab`

### Refactoring

- **frontend** refactor前端应用壳层实现 — 2026-06-29 — commit `39ac32b`
- **renderer** 统一子应用startup入口并集成运行时 — 2026-06-29 — commit `82db36f`
- **config** 移除重复的 baseUrl configuration并improve代码结构 — 2026-06-26 — commit `89a8cef`
- **integration** refactor集成应用dependency和API结构 — 2026-06-26 — commit `c9735c2`
- **electron** 将认证模块从 WindowManager 中分离 (translation pending) — 2026-06-25 — commit `cb38082`
- **cross-cutting** 调整项目包结构并updatedependency版本 — 2026-06-25 — commit `9ada30d`
- **tsconfig** update TypeScript configuration以support新集成文件 — 2026-06-25 — commit `9596100`
- **electron** refactor Electron preload 架构并统一configuration管理 — 2026-06-25 — commit `c63e1c3`
- **cross-cutting** 完成多组织管理与布局component基建 — 2026-06-21 — commit `472a910`
- **sub-web/docs** refactordocumentation站点为多页面架构，add前后端documentation首页 — 2026-06-11 — commit `aca0782`

### Tests & quality

- **integration** 迁移test文件并updateconfiguration — 2026-06-26 — commit `4990d46`

## Period: 2026-05

### Refactoring

- **.github** 迁移 .cursor/rules 规则文件到 agent-skills 目录 (translation pending) — 2026-05-28 — commit `b69bf94`

### Fixes

- **cross-cutting** resolve crypto.subtle availability issue and type errors — 2026-05-28 — commit `9b0d758`
- **.gitignore** preserve tailwind theme styles in docs web build — 2026-05-09 — commit `e90dd55`

### Other

- **docs** 编辑器集成 (translation pending) — 2026-05-19 — commit `c60f021`
- **docs** 编辑器集成 (translation pending) — 2026-05-19 — commit `dee8a0d`
- **docs** 集成monacotest — 2026-05-18 — commit `af6a09b`

### Maintenance

- **.vscode** enhance VSCode settings for improved development experience — 2026-05-14 — commit `7ad1ada`
- **docs** refine styles and configurations across components — 2026-05-14 — commit `257d80a`
- **package.json** update package versions in configuration files — 2026-05-14 — commit `7bb3f09`
- **cross-cutting** cap oxlint threads and sync workspace changes — 2026-05-13 — commit `5cfc6bf`
- **cross-cutting** checkpoint monorepo layout, styles, and internal tooling — 2026-05-12 — commit `5e13289`
- **.vscode** update VSCode settings to ignore unknown at-rules for CSS, SCSS, and LESS — 2026-05-11 — commit `78bae29`
- **electron** clean up docs application and update configurations — 2026-05-11 — commit `68be5de`
- **.github** remove GitHub Actions workflow for docs deployment — 2026-05-10 — commit `6235d00`
- **.github** update docs deploy triggers and ignore web build output — 2026-05-10 — commit `2b93cbe`
- **.github** update docs deploy workflow to specify artifact name for deployment — 2026-05-09 — commit `8ca6e2b`
- **.github** remove pnpm version specification in docs deploy workflow — 2026-05-09 — commit `517fa3c`
- **electron** update dependencies and TypeScript configurations for Electron app — 2026-05-09 — commit `e43f432`
- **electron** update project configuration for Electron app — 2026-05-09 — commit `2f564c0`
- **cross-cutting** clear apps, packages, scripts for electron-vite branch — 2026-05-09 — commit `11aae31`

### Features

- **cross-cutting** internal renderer Vite package and docs shell responsiveness — 2026-05-11 — commit `5e627b2`
- **cross-cutting** Nebula UI docs, app-shell split, web embeds; drop docs-vitepress workspace — 2026-05-11 — commit `a061daf`
- **cross-cutting** add shell app hub and reusable login flow — 2026-05-10 — commit `f067061`
- **electron** add marked package and update theme and locale handling in docs — 2026-05-09 — commit `aa5c23a`
- **electron** rename demo renderer to docs and add docs deploy workflow — 2026-05-09 — commit `4024133`
- **apps** add demo component and remove unused pdm .gitignore — 2026-05-07 — commit `3e33c1e`

## Period: 2026-04

### Features

- **electron** initialize Vue 3 project with Vite, add HelloWorld component and assets — 2026-04-30 — commit `9b36366`
- **tooling** enhance test imports and improve build script error handling — 2026-04-30 — commit `a7d9798`
- **cross-cutting** initialize frontend application with Vue, Vite, and TypeScript — 2026-04-29 — commit `ee5ad65`
- **security** implement abstract security module and block disallowed origins — 2026-04-29 — commit `37b308b`
- **.vscode** update VS Code extensions recommendations and refine linting configurations — 2026-04-29 — commit `829f955`
- **electron** add Oxlint configurations for JavaScript, Node, TypeScript, and Tailwind CSS — 2026-04-29 — commit `8d63277`
- **electron** add tests for capacitor and host services, implement logging and text utilities — 2026-04-27 — commit `4b2968d`
- **.github** add pnpm workspace configuration, TypeScript settings, and Vite setup — 2026-04-21 — commit `7524d6d`

### Maintenance

- **.npmrc** update .npmrc and pnpm-workspace.yaml for improved configuration — 2026-04-30 — commit `65517e1`
- **.editorconfig** update pnpm workspace and add stylelint configuration — 2026-04-29 — commit `5da8cd2`

## Source note

Generated deterministically from Git history. Names, paths, SHAs and links are preserved.
