<script setup lang="ts">
import { NebulaButton } from '@nebula-studio/nebula-ui';
import { PluginNodeForm } from '@nebula-studio/nebula-low-render';
import type { PluginNodeSchema } from '@nebula-studio/nebula-low-render';

const selectedConfig = defineModel<Record<string, unknown>>('selectedConfig', {
  required: true,
});

defineProps<{
  selectedNodeLabel: string;
  selectedSchema: PluginNodeSchema;
}>();

const emit = defineEmits<{
  deleteNode: [];
}>();
</script>

<template>
  <aside class="dag-editor__panel">
    <div class="dag-editor__panel-head">
      <div>
        <p class="dag-editor__panel-kicker">节点配置</p>
        <h4 class="dag-editor__panel-title">{{ selectedNodeLabel }}</h4>
      </div>
      <NebulaButton variant="secondary" @click="emit('deleteNode')">
        删除
      </NebulaButton>
    </div>
    <PluginNodeForm
      v-model="selectedConfig"
      :schema="selectedSchema"
      :show-title="false"
    />
  </aside>
</template>

<style scoped>
.dag-editor__panel {
  padding: 10px;
  overflow: visible;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.dag-editor__panel-head {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
}

.dag-editor__panel-kicker {
  margin: 0 0 4px;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.dag-editor__panel-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}
</style>
