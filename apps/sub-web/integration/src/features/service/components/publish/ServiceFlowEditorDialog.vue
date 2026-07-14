<script setup lang="ts">
import { NebulaButton, NebulaPane } from '@nebula-studio/nebula-ui';
import IntegrationBpmnEditor from '@nebula-studio/nebula-flow-editor/components/IntegrationBpmnEditor.vue';

import type { ApiInterface } from '@/shared/types';

defineProps<{
  open: boolean;
  xml: string;
  atomicInterfaces: ApiInterface[];
}>();

const emit = defineEmits<{
  close: [];
  submit: [];
  'update:xml': [value: string];
}>();
</script>

<template>
  <div v-if="open" class="modal-overlay modal-overlay--full">
    <NebulaPane title="组合服务流程设计" class="modal modal--large">
      <div class="bpmn-wrap">
        <IntegrationBpmnEditor
          :xml="xml"
          :atomic-interfaces="atomicInterfaces"
          @update:xml="emit('update:xml', $event)"
          @changed="() => {}"
        />
      </div>
      <div class="modal__actions">
        <NebulaButton variant="outline" @click="emit('close')"
          >取消</NebulaButton
        >
        <NebulaButton @click="emit('submit')">保存流程</NebulaButton>
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

.modal--large {
  width: min(96vw, 1200px);
  max-height: 92vh;
  overflow: auto;
}

.bpmn-wrap {
  height: min(70vh, 640px);
  margin-bottom: 12px;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
