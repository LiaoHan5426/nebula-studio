---
title: 安装指南
description: 如何安装和配置 Nebula Studio
---

# 安装指南

## 环境要求

- Node.js >= 18
- pnpm >= 8

## 安装

```bash
# 使用 pnpm
pnpm add @nebula-studio/nebula-ui

# 使用 npm
npm install @nebula-studio/nebula-ui
```

## 快速开始

### 全局注册

```typescript
import { createApp } from 'vue';
import NebulaUI from '@nebula-studio/nebula-ui';
import '@nebula-studio/nebula-ui/styles.css';

const app = createApp(App);
app.use(NebulaUI);
```

### 按需引入

```typescript
import { NebulaButton, NebulaInput } from '@nebula-studio/nebula-ui';
```

## 主题配置

Nebula UI 使用 CSS 变量实现主题系统。在根元素上设置变量即可自定义主题：

```css
:root {
  --primary: 220 90% 56%;
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --border: 214 32% 91%;
}
```

### 暗色模式

添加 `dark` 类到根元素即可启用暗色模式：

```javascript
document.documentElement.classList.add('dark');
```
