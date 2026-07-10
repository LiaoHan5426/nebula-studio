<template>
  <div class="plugin-market-page">
    <h2>插件市场</h2>
    <p class="hint">从远程 Maven 仓库浏览与安装插件</p>
    <div class="search-bar">
      <input
        v-model="keyword"
        placeholder="搜索插件..."
        @keyup.enter="search"
      />
      <button @click="search">搜索</button>
    </div>
    <p v-if="installMessage" class="install-message">{{ installMessage }}</p>
    <ul class="plugin-list">
      <li v-for="plugin in plugins" :key="plugin.pluginId">
        <strong>{{ plugin.name || plugin.pluginId }}</strong>
        <span>{{ plugin.version }}</span>
        <button @click="install(plugin.pluginId, plugin.version)">安装</button>
      </li>
      <li v-if="plugins.length === 0">暂无插件</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface MarketPlugin {
  pluginId: string;
  name?: string;
  version: string;
}

const keyword = ref('');
const plugins = ref<MarketPlugin[]>([]);
const installMessage = ref('');

function search() {
  plugins.value = keyword.value
    ? [{ pluginId: keyword.value, name: keyword.value, version: '1.0.0' }]
    : [];
  installMessage.value = '';
}

function install(pluginId: string, version: string) {
  installMessage.value = `已请求安装 ${pluginId}@${version}`;
}
</script>

<style scoped>
.plugin-market-page {
  padding: 16px;
}

.search-bar {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}

.install-message {
  margin: 0 0 12px;
  color: var(--text-secondary, #6b7280);
}

.plugin-list {
  padding: 0;
  list-style: none;
}

.plugin-list li {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}
</style>
