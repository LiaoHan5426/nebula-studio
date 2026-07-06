---
title: 项目介绍
description: Nebula Studio 全栈组件库概览
---

# Nebula Studio

Nebula Studio 是一个基于 **Vue 3 + TypeScript** 的企业级全栈组件库，提供丰富的高质量组件与完善的文档支持。

## 特性

- **丰富的组件** — 涵盖表单、数据展示、反馈、导航、内容等类别的 20+ 组件
- **TypeScript 优先** — 所有组件提供完整类型定义，享受完美的编辑器智能提示
- **主题定制** — 基于 CSS 变量的主题系统，支持亮色/暗色模式一键切换
- **暗色模式** — 内置暗色模式支持，所有组件均已适配
- **微前端架构** — 支持作为独立应用或微前端子应用运行

## 技术栈

| 技术         | 说明                       |
| ------------ | -------------------------- |
| Vue 3        | 渐进式 JavaScript 框架     |
| TypeScript   | 类型安全的 JavaScript 超集 |
| Vite         | 下一代前端构建工具         |
| Reka UI      | 无头组件基础库             |
| Tailwind CSS | 原子化 CSS 引擎            |

## 包结构

```
nebula-studio/
├── packages/
│   ├── ui/nebula-ui/       # 核心组件库
│   ├── core/app-shell/     # 应用壳层
│   ├── core/shell/         # Shell 集成
│   └── core/runtime/       # 运行时
├── apps/
│   ├── web/                # 主应用
│   └── sub-web/docs/       # 文档子应用
└── configs/
    └── windows.json        # 窗口配置
```
