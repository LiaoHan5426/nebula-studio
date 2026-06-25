<script setup lang="ts">
import type { PluginNodeSchema } from '@nebula-studio/nebula-low-render';
import { computed } from 'vue';

const props = defineProps<{
  nodeSchemas?: Record<string, PluginNodeSchema>;
}>();

const emit = defineEmits<{
  add: [payload: { type: string; label: string }];
}>();

const paletteGroups = computed(() => {
  const schemas = props.nodeSchemas ?? {};
  const basic: Array<{ type: string; label: string }> = [];
  const plugins: Array<{ type: string; label: string }> = [];

  for (const [type, schema] of Object.entries(schemas)) {
    const entry = {
      type,
      label: String(schema.label ?? type),
    };
    if (type === 'INTERFACE') {
      basic.push(entry);
    } else {
      plugins.push(entry);
    }
  }

  basic.sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'));
  plugins.sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'));

  return { basic, plugins };
});

function handleAdd(type: string, label: string) {
  emit('add', { type, label });
}
</script>

<template>
  <aside class="dag-node-palette">
    <header class="dag-node-palette__head">
      <h3 class="dag-node-palette__title">节点列表</h3>
      <p class="dag-node-palette__hint">点击添加；拖出节点到目标节点连线</p>
    </header>

    <section v-if="paletteGroups.basic.length" class="dag-node-palette__group">
      <h4 class="dag-node-palette__group-title">基础节点</h4>
      <ul class="dag-node-palette__list">
        <li v-for="item in paletteGroups.basic" :key="item.type">
          <button
            type="button"
            class="dag-node-palette__item"
            @click="handleAdd(item.type, item.label)"
          >
            <span class="dag-node-palette__item-label">{{ item.label }}</span>
            <span class="dag-node-palette__item-type">{{ item.type }}</span>
          </button>
        </li>
      </ul>
    </section>

    <section
      v-if="paletteGroups.plugins.length"
      class="dag-node-palette__group"
    >
      <h4 class="dag-node-palette__group-title">插件节点</h4>
      <ul class="dag-node-palette__list">
        <li v-for="item in paletteGroups.plugins" :key="item.type">
          <button
            type="button"
            class="dag-node-palette__item"
            @click="handleAdd(item.type, item.label)"
          >
            <span class="dag-node-palette__item-label">{{ item.label }}</span>
            <span class="dag-node-palette__item-type">{{ item.type }}</span>
          </button>
        </li>
      </ul>
    </section>

    <p
      v-if="!paletteGroups.basic.length && !paletteGroups.plugins.length"
      class="dag-node-palette__empty"
    >
      暂无可用节点，请检查插件目录是否已加载。
    </p>
  </aside>
</template>

<style scoped>
.dag-node-palette {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  min-height: 0;
  padding: 10px;
  overflow: auto;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.dag-node-palette__head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dag-node-palette__title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
}

.dag-node-palette__hint {
  margin: 0;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.dag-node-palette__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dag-node-palette__group-title {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
}

.dag-node-palette__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.dag-node-palette__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  padding: 6px 8px;
  text-align: left;
  cursor: pointer;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.dag-node-palette__item:hover {
  background: hsl(var(--accent) / 30%);
  border-color: hsl(var(--primary) / 60%);
}

.dag-node-palette__item-label {
  font-size: 12px;
  font-weight: 500;
}

.dag-node-palette__item-type {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.dag-node-palette__empty {
  margin: 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}
</style>
