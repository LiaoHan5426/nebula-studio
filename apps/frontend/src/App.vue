<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

/** 顶栏高度须与 `apps/electron/app.config.ts` 中 `shell.topInsetPx` 一致 */
const SHELL_TOP_PX = 56;

/** 与主进程 BrowserView 同宽：右侧停靠 DevTools 时 innerWidth 已不含 DevTools，避免与 getContentBounds 重复扣宽 */
function reportShellViewport(): void {
  window.electron.ipcRenderer.send('shell-viewport', {
    width: window.innerWidth,
  });
}

const ipcHandle = (): void => window.electron.ipcRenderer.send('ping');

onMounted(() => {
  reportShellViewport();
  window.addEventListener('resize', reportShellViewport);
  requestAnimationFrame(() => reportShellViewport());
});

onUnmounted(() => {
  window.removeEventListener('resize', reportShellViewport);
});
</script>

<template>
  <div class="shell" :style="{ '--shell-top': `${SHELL_TOP_PX}px` }">
    <header class="shell-bar">
      <span class="shell-brand">Nebula Studio</span>
      <span class="shell-desc">
        应用底座（BrowserWindow）— 子应用内容区由主进程以 BrowserView
        嵌入，此处不使用 webview。
      </span>
      <button type="button" class="shell-btn" @click="ipcHandle">
        Ping 主进程
      </button>
    </header>
    <!-- 顶栏以下区域由 BrowserView 叠放绘制；壳层页面无需占位 DOM -->
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  margin: 0;
  background: #0f0f14;
}

.shell-bar {
  box-sizing: border-box;
  display: flex;
  gap: 12px;
  align-items: center;
  height: var(--shell-top);
  padding: 0 14px;
  font:
    13px/1.4 system-ui,
    sans-serif;
  color: #e8e8ef;
  background: #14141c;
  border-bottom: 1px solid #2a2a36;
  -webkit-app-region: drag;
}

.shell-brand {
  flex-shrink: 0;
  font-weight: 700;
  -webkit-app-region: drag;
}

.shell-desc {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: #9898a8;
  -webkit-app-region: drag;
}

.shell-btn {
  flex-shrink: 0;
  padding: 6px 12px;
  font: inherit;
  color: #e8e8ef;
  cursor: pointer;
  background: #24242e;
  border: 1px solid #3d3d4d;
  border-radius: 8px;
  -webkit-app-region: no-drag;
}

.shell-btn:hover {
  background: #32323e;
}
</style>
