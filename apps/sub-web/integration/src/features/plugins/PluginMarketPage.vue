<script setup lang="ts">
import { ref } from 'vue';
import {
  NebulaButton,
  NebulaInput,
  NebulaPane,
} from '@nebula-studio/nebula-ui';

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

<template>
  <div class="page">
    <NebulaPane title="插件市场" description="从远程 Maven 仓库浏览与安装插件">
      <div class="page__toolbar">
        <NebulaInput
          v-model="keyword"
          placeholder="搜索插件..."
          class="plugin-market__search"
          @keydown.enter="search"
        />
        <NebulaButton variant="primary" @click="search">搜索</NebulaButton>
      </div>

      <p v-if="installMessage" class="page__notice">{{ installMessage }}</p>

      <div v-if="plugins.length === 0" class="page__empty">暂无插件</div>
      <div v-else class="page__list">
        <article
          v-for="plugin in plugins"
          :key="plugin.pluginId"
          class="page__card plugin-market__card"
        >
          <div class="page__card-head">
            <div>
              <h3>{{ plugin.name || plugin.pluginId }}</h3>
              <p class="page__meta">v{{ plugin.version }}</p>
            </div>
            <NebulaButton
              variant="outline"
              @click="install(plugin.pluginId, plugin.version)"
            >
              安装
            </NebulaButton>
          </div>
        </article>
      </div>
    </NebulaPane>
  </div>
</template>

<style scoped>
.plugin-market__search {
  min-width: 240px;
}

.plugin-market__card h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
</style>
