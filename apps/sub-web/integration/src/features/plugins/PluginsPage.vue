<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NebulaButton, NebulaTable } from '@nebula-studio/nebula-ui';

const route = useRoute();
const router = useRouter();

// 插件类型映射
const pluginTypeMap: Record<
  string,
  { label: string; icon: string; desc: string }
> = {
  database: {
    label: '数据库适配插件',
    icon: '🗄️',
    desc: '适配需要连接的数据库，如 PostgreSQL、MySQL 等',
  },
  protocol: {
    label: '协议插件',
    icon: '🔗',
    desc: '适配需要的连接协议，如 HTTP、TCP 等',
  },
  preprocessor: {
    label: '前置处理器插件',
    icon: '⚡',
    desc: '在请求处理前进行预处理，参考 Camel 前置处理器',
  },
  postprocessor: {
    label: '后置处理器插件',
    icon: '🔄',
    desc: '在请求处理后进行后置处理，参考 Camel 后置处理器',
  },
  aggregator: {
    label: '聚合插件',
    icon: '📦',
    desc: '聚合多个处理结果，参考 Camel 聚合处理器',
  },
  dispatcher: {
    label: '分发插件',
    icon: '📤',
    desc: '复制分发、条件分发等，参考 Camel 分发处理器',
  },
  transformer: {
    label: '转换插件',
    icon: '🔀',
    desc: '转换数据格式，放在处理步骤前为参数转换，放在后为结果转换',
  },
};

const pluginType = computed(() => {
  // 从路径 /plugins/database 中提取类型
  const pathParts = route.path.split('/');
  return pathParts[pathParts.length - 1] || 'database';
});
const pluginInfo = computed(
  () => pluginTypeMap[pluginType.value] || pluginTypeMap.database,
);

const columns = [
  { key: 'name', label: '插件名称', width: 200 },
  { key: 'type', label: '类型', width: 120 },
  { key: 'version', label: '版本', width: 100 },
  { key: 'description', label: '描述' },
  { key: 'status', label: '状态', width: 100 },
  { key: 'actions', label: '操作', width: 150 },
];

// 模拟数据
const plugins = ref([
  {
    id: '1',
    name: 'PostgreSQL Connector',
    type: 'database',
    version: '1.0.0',
    description: 'PostgreSQL 数据库连接适配器',
    status: 'enabled',
  },
  {
    id: '2',
    name: 'MySQL Connector',
    type: 'database',
    version: '1.0.0',
    description: 'MySQL 数据库连接适配器',
    status: 'enabled',
  },
]);

const loading = ref(false);

onMounted(() => {
  loadPlugins();
});

async function loadPlugins() {
  loading.value = true;
  // TODO: 调用 API 获取插件列表
  setTimeout(() => {
    loading.value = false;
  }, 300);
}

function handleEdit(plugin: (typeof plugins.value)[0]) {
  void plugin;
}

function handleDelete(plugin: (typeof plugins.value)[0]) {
  void plugin;
}

function handleEnable(plugin: (typeof plugins.value)[0]) {
  void plugin;
}
</script>

<template>
  <div class="plugin-page">
    <header class="plugin-page__header">
      <div class="plugin-page__title-row">
        <span class="plugin-page__icon">{{ pluginInfo.icon }}</span>
        <h2 class="plugin-page__title">{{ pluginInfo.label }}</h2>
      </div>
      <p class="plugin-page__desc">{{ pluginInfo.desc }}</p>
    </header>

    <div class="plugin-page__actions">
      <NebulaButton variant="primary" @click="() => {}">
        新增插件
      </NebulaButton>
    </div>

    <NebulaTable
      :columns="columns"
      :data="plugins"
      :loading="loading"
      row-key="id"
    >
      <template #status="{ row }">
        <span :class="['status-badge', row.status]">
          {{ row.status === 'enabled' ? '已启用' : '已禁用' }}
        </span>
      </template>
      <template #actions="{ row }">
        <div class="action-btns">
          <NebulaButton size="small" variant="ghost" @click="handleEdit(row)">
            编辑
          </NebulaButton>
          <NebulaButton size="small" variant="ghost" @click="handleEnable(row)">
            {{ row.status === 'enabled' ? '禁用' : '启用' }}
          </NebulaButton>
          <NebulaButton size="small" variant="ghost" @click="handleDelete(row)">
            删除
          </NebulaButton>
        </div>
      </template>
    </NebulaTable>
  </div>
</template>

<style scoped>
.plugin-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.plugin-page__header {
  padding: 16px 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.plugin-page__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.plugin-page__icon {
  font-size: 20px;
}

.plugin-page__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.plugin-page__desc {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.plugin-page__actions {
  display: flex;
  gap: 8px;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.status-badge.enabled {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 12%);
}

.status-badge.disabled {
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted));
}

.action-btns {
  display: flex;
  gap: 4px;
}
</style>
