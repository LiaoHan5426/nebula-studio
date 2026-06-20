<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import { computed } from 'vue';

const props = defineProps<{
  id: string;
  data: {
    label?: string;
    type?: string;
  };
  selected?: boolean;
}>();

const displayLabel = computed(() => String(props.data?.label ?? props.id));
const showKind = computed(
  () =>
    props.data?.type === 'INTERFACE' &&
    props.data?.label &&
    props.data.label !== '原子服务调用',
);
const showType = computed(
  () => props.data?.type && props.data.type !== 'INTERFACE',
);
</script>

<template>
  <div class="dag-flow-node" :class="{ 'dag-flow-node--selected': selected }">
    <Handle
      id="target"
      type="target"
      :position="Position.Left"
      class="dag-flow-node__handle dag-flow-node__handle--target"
    />
    <div class="dag-flow-node__body" :title="displayLabel">
      <span class="dag-flow-node__label">{{ displayLabel }}</span>
      <span v-if="showKind" class="dag-flow-node__type">原子服务</span>
      <span v-else-if="showType" class="dag-flow-node__type">{{
        data.type
      }}</span>
    </div>
    <Handle
      id="source"
      type="source"
      :position="Position.Right"
      class="dag-flow-node__handle dag-flow-node__handle--source"
    />
  </div>
</template>

<style scoped>
.dag-flow-node {
  position: relative;
  width: 124px;
}

.dag-flow-node__body {
  padding: 6px 8px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 6%);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.dag-flow-node--selected .dag-flow-node__body {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 1px hsl(var(--primary) / 35%);
}

.dag-flow-node__label {
  display: block;
  overflow: hidden;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dag-flow-node__type {
  display: block;
  margin-top: 2px;
  overflow: hidden;
  font-size: 10px;
  color: hsl(var(--muted-foreground));
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dag-flow-node__handle {
  opacity: 0;
  background: transparent;
  border: none;
  min-width: 0;
  min-height: 0;
}

.dag-flow-node__handle--target {
  top: 50%;
  left: -16px;
  width: 32px;
  height: 70%;
  transform: translateY(-50%);
}

.dag-flow-node__handle--source {
  top: 50%;
  right: -16px;
  width: 32px;
  height: 70%;
  transform: translateY(-50%);
}
</style>
