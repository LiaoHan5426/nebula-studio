<script setup lang="ts">
import { isWebPresentationHost } from '@nebula-studio/app-shell';
import { computed, reactive } from 'vue';

const versions = reactive({ ...window.electron.process.versions });
const isWeb = isWebPresentationHost();

function osDisplayName(platform: string | undefined): string {
  if (!platform) return '未知';
  if (platform === 'win32') return 'Windows';
  if (platform === 'darwin') return 'macOS';
  if (platform === 'linux') return 'Linux';
  if (platform === 'freebsd') return 'FreeBSD';
  return platform;
}

const nodeTitle = isWeb
  ? '构建该 Web 包时使用的 Node 版本（浏览器内无 Node 运行时）'
  : undefined;
const browserTitle = isWeb
  ? '当前浏览器的 Chromium 系内核主版本（自 User-Agent 解析）'
  : undefined;
const platformTitle = computed(() => {
  if (isWeb) {
    return '静态 Web 宿主（非 Electron 桌面运行时）';
  }
  const raw = window.electron.process.platform;
  const name = osDisplayName(raw);
  return `运行平台：${name}（${raw}） · Electron ${versions.electron}`;
});
</script>

<template>
  <ul class="versions">
    <li class="version-chip" :title="platformTitle">
      <span class="version-key">Platform</span>
      <span class="version-value">{{ versions.electron }}</span>
    </li>
    <li class="version-chip" :title="browserTitle">
      <span class="version-key">{{ isWeb ? 'Browser' : 'Chromium' }}</span>
      <span class="version-value">{{ versions.chrome }}</span>
    </li>
    <li class="version-chip" :title="nodeTitle">
      <span class="version-key">{{ isWeb ? 'Node (build)' : 'Node' }}</span>
      <span class="version-value">{{ versions.node }}</span>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.versions {
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: max-content;
}

.version-chip {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 4px 9px;
  font-size: 11px;
  line-height: 1;
  color: hsl(var(--foreground));
  white-space: nowrap;
  background: hsl(var(--muted) / 70%);
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
}

.version-key {
  color: hsl(var(--muted-foreground));
}

.version-value {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  color: hsl(var(--foreground));
}
</style>
