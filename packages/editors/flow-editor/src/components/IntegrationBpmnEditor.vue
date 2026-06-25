<script setup lang="ts">
import { computed } from 'vue';

import BpmnEditor from './BpmnEditor.vue';

export interface AtomicInterfaceOption {
  interfaceId: string;
  interfaceName: string;
  endpointUri?: string;
  method?: string;
}

defineProps<{
  atomicInterfaces?: AtomicInterfaceOption[];
}>();

const xml = defineModel<string>('xml');

const emit = defineEmits<{
  (e: 'changed'): void;
}>();

const hints = computed(() => [
  '从左侧调色板拖拽 Service Task 编排原子接口调用',
  'Service Task 的 name 会作为后端执行步骤标识（建议使用原子接口名称）',
  '保存后发布流程，或通过组合接口关联 flowDefinitionId 执行',
]);
</script>

<template>
  <div class="integration-bpmn-editor">
    <div class="integration-bpmn-editor__main">
      <BpmnEditor
        :xml="xml"
        mode="integration"
        @update:xml="xml = $event"
        @changed="emit('changed')"
      />
    </div>
    <aside class="integration-bpmn-editor__aside">
      <section class="aside-section">
        <h3 class="aside-section__title">集成平台说明</h3>
        <ul class="aside-section__list">
          <li v-for="hint in hints" :key="hint">{{ hint }}</li>
        </ul>
      </section>
      <section class="aside-section">
        <h3 class="aside-section__title">可调用原子接口</h3>
        <p v-if="!atomicInterfaces?.length" class="aside-section__empty">
          暂无原子接口。请先在「服务注册」创建 ATOMIC 类型服务。
        </p>
        <ul v-else class="interface-list">
          <li
            v-for="item in atomicInterfaces"
            :key="item.interfaceId"
            class="interface-list__item"
          >
            <strong>{{ item.interfaceName }}</strong>
            <span class="interface-list__meta">{{ item.interfaceId }}</span>
            <span v-if="item.endpointUri" class="interface-list__meta">
              {{ item.method ?? 'GET' }} {{ item.endpointUri }}
            </span>
          </li>
        </ul>
      </section>
    </aside>
  </div>
</template>

<style scoped>
.integration-bpmn-editor {
  display: flex;
  gap: 12px;
  height: 100%;
  min-height: 480px;
}

.integration-bpmn-editor__main {
  flex: 1;
  min-width: 0;
}

.integration-bpmn-editor__aside {
  width: 280px;
  flex-shrink: 0;
  padding: 12px;
  overflow: auto;
  background: hsl(var(--muted) / 35%);
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.aside-section + .aside-section {
  margin-top: 16px;
}

.aside-section__title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
}

.aside-section__list {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
}

.aside-section__empty {
  margin: 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.interface-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.interface-list__item {
  padding: 8px;
  margin-bottom: 6px;
  font-size: 12px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.interface-list__item strong {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
}

.interface-list__meta {
  display: block;
  color: hsl(var(--muted-foreground));
  word-break: break-all;
}
</style>
