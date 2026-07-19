<script setup lang="ts">
import { computed, ref } from 'vue';
import { NebulaIcon, PRESET_ICONS } from '@nebula-studio/nebula-ui';

const query = ref('');
const copied = ref('');
let copiedTimer: ReturnType<typeof setTimeout> | undefined;

const groups = [
  {
    name: '导航与文件',
    keys: ['home', 'settings', 'file', 'integration', 'folder', 'folderOpen'],
  },
  {
    name: '方向',
    keys: [
      'chevronLeft',
      'chevronRight',
      'chevronUp',
      'chevronDown',
      'arrowLeft',
      'arrowRight',
      'arrowUp',
      'arrowDown',
    ],
  },
  {
    name: '状态',
    keys: ['check', 'warning', 'error', 'info', 'success', 'help'],
  },
  {
    name: '编辑器',
    keys: [
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'alignLeft',
      'alignCenter',
      'alignRight',
      'alignJustify',
    ],
  },
];
const groupedKeys = new Set(groups.flatMap((group) => group.keys));
groups.splice(1, 0, {
  name: '操作与界面',
  keys: Object.keys(PRESET_ICONS).filter((key) => !groupedKeys.has(key)),
});

const filteredGroups = computed(() => {
  const keyword = query.value.trim().toLowerCase();
  return groups
    .map((group) => ({
      ...group,
      keys: group.keys.filter((key) => key.toLowerCase().includes(keyword)),
    }))
    .filter((group) => group.keys.length > 0);
});

async function copyName(name: string): Promise<void> {
  await navigator.clipboard.writeText(name);
  copied.value = name;
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => (copied.value = ''), 1600);
}
</script>

<template>
  <div class="icon-browser">
    <div class="icon-browser__toolbar">
      <label>
        <span class="sr-only">搜索内置图标</span>
        <input v-model="query" type="search" placeholder="搜索图标名称…" />
      </label>
      <span>{{ Object.keys(PRESET_ICONS).length }} 个图标 · 点击复制名称</span>
    </div>

    <section v-for="group in filteredGroups" :key="group.name">
      <h3>
        {{ group.name }} <small>{{ group.keys.length }}</small>
      </h3>
      <div class="icon-browser__grid">
        <button
          v-for="name in group.keys"
          :key="name"
          type="button"
          :title="`复制 ${name}`"
          @click="copyName(name)"
        >
          <NebulaIcon :icon="name" size="22" />
          <span>{{ name }}</span>
        </button>
      </div>
    </section>

    <p v-if="filteredGroups.length === 0" class="icon-browser__empty">
      未找到匹配图标
    </p>
    <p
      class="icon-browser__toast"
      :class="{ 'is-visible': copied }"
      role="status"
    >
      已复制：{{ copied }}
    </p>
  </div>
</template>

<style scoped>
.icon-browser {
  position: relative;
  display: grid;
  gap: 20px;
}

.icon-browser__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.icon-browser__toolbar input {
  width: min(320px, 70vw);
  min-height: 38px;
  padding: 7px 11px;
  color: hsl(var(--foreground));
  outline: none;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.icon-browser__toolbar input:focus {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 15%);
}

.icon-browser h3 {
  margin: 0 0 10px;
  font-size: 14px;
}

.icon-browser h3 small {
  font-weight: 500;
  color: hsl(var(--muted-foreground));
}

.icon-browser__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(116px, 1fr));
  gap: 8px;
}

.icon-browser__grid button {
  display: grid;
  gap: 8px;
  place-items: center;
  min-height: 78px;
  padding: 10px 7px;
  color: hsl(var(--foreground));
  cursor: pointer;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 9px;
  transition:
    transform 120ms ease,
    border-color 120ms ease,
    background 120ms ease;
}

.icon-browser__grid button:hover {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 7%);
  border-color: hsl(var(--primary) / 45%);
  transform: translateY(-1px);
}

.icon-browser__grid button span {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  white-space: nowrap;
}

.icon-browser__empty {
  padding: 30px;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.icon-browser__toast {
  position: sticky;
  bottom: 16px;
  justify-self: center;
  padding: 8px 12px;
  color: hsl(var(--primary-foreground));
  pointer-events: none;
  background: hsl(var(--primary));
  border-radius: 999px;
  opacity: 0;
  transform: translateY(8px);
  transition: 160ms ease;
}

.icon-browser__toast.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip-path: inset(50%);
}
</style>
