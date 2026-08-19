<script setup lang="ts">
import type { DagDefinition } from '@nebula-studio/nebula-dag-editor';
import type { PluginNodeSchema } from '@nebula-studio/nebula-low-render';

import { DagEditor } from '@nebula-studio/nebula-dag-editor';
import { NebulaButton, NebulaDialog } from '@nebula-studio/nebula-ui';

defineProps<{
  definition: DagDefinition | string;
  nodeSchemas: Record<string, PluginNodeSchema>;
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submit: [];
  'update:definition': [value: DagDefinition | string];
}>();
</script>

<template>
  <NebulaDialog
    :open="open"
    title="组合服务 DAG 编排"
    size="full"
    @update:open="!$event && emit('close')"
  >
    <div class="modal__content--dag">
      <DagEditor
        :model-value="definition"
        :node-schemas="nodeSchemas"
        @update:model-value="emit('update:definition', $event)"
      />
    </div>
    <div class="modal__actions">
      <NebulaButton variant="outline" @click="emit('close')">
        取消
      </NebulaButton>
      <NebulaButton @click="emit('submit')">保存 DAG</NebulaButton>
    </div>
  </NebulaDialog>
</template>

<style scoped>
.modal__content--dag {
  min-height: 420px;
  height: min(70vh, 640px);
  overflow: hidden;
}

.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
