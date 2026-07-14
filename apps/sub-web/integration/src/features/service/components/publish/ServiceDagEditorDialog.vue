<script setup lang="ts">
import { NebulaButton, NebulaPane } from '@nebula-studio/nebula-ui';
import { DagEditor } from '@nebula-studio/nebula-dag-editor';
import type { DagDefinition } from '@nebula-studio/nebula-dag-editor';
import type { PluginNodeSchema } from '@nebula-studio/nebula-low-render';

defineProps<{
  open: boolean;
  definition: DagDefinition | string;
  nodeSchemas: Record<string, PluginNodeSchema>;
}>();

const emit = defineEmits<{
  close: [];
  submit: [];
  'update:definition': [value: DagDefinition | string];
}>();
</script>

<template>
  <div v-if="open" class="modal-overlay modal-overlay--full">
    <NebulaPane title="组合服务 DAG 编排" class="modal modal--dag">
      <div class="modal__content--dag">
        <DagEditor
          :model-value="definition"
          :node-schemas="nodeSchemas"
          @update:model-value="emit('update:definition', $event)"
        />
      </div>
      <div class="modal__actions">
        <NebulaButton variant="outline" @click="emit('close')"
          >取消</NebulaButton
        >
        <NebulaButton @click="emit('submit')">保存 DAG</NebulaButton>
      </div>
    </NebulaPane>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 45%);
}

.modal-overlay--full {
  align-items: stretch;
  justify-content: center;
  padding: 16px;
}

.modal--dag {
  display: flex;
  flex-direction: column;
  width: min(96vw, 1200px);
  max-height: 92vh;
}

.modal__content--dag {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
