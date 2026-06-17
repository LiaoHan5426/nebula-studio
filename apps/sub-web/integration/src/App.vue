<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="app-title">Nebula 集成平台</h1>
        <p class="app-subtitle">基于 Camel 的动态集成解决方案</p>
      </div>
      <nav class="sidebar-nav">
        <RouterLink to="/subscriptions" class="nav-link">
          <span class="nav-icon">📊</span>
          <span class="nav-text">库表订阅</span>
        </RouterLink>
        <RouterLink to="/interfaces" class="nav-link">
          <span class="nav-icon">🔗</span>
          <span class="nav-text">接口管理</span>
        </RouterLink>
        <RouterLink to="/connectors" class="nav-link">
          <span class="nav-icon">🔌</span>
          <span class="nav-text">连接器管理</span>
        </RouterLink>
        <RouterLink to="/datasources" class="nav-link">
          <span class="nav-icon">💾</span>
          <span class="nav-text">数据源管理</span>
        </RouterLink>
      </nav>
    </aside>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.app-container {
  display: flex;
  width: 100%;
  height: 100%;
}

.sidebar {
  width: 260px;
  background: hsl(var(--card));
  border-right: 1px solid hsl(var(--border));
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid hsl(var(--border));
}

.app-title {
  font-size: 18px;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin-bottom: 4px;
}

.app-subtitle {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: hsl(var(--foreground));
  text-decoration: none;
  transition: all 0.2s;
  font-size: 14px;
}

.nav-link:hover {
  background: hsl(var(--muted));
}

.nav-link.router-link-active {
  background: hsl(var(--primary) / 14%);
  color: hsl(var(--primary));
  font-weight: 500;
}

.nav-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.nav-text {
  flex: 1;
}

.main-content {
  flex: 1;
  overflow: auto;
  background: hsl(var(--background));
}
</style>
