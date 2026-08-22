<script setup lang="ts">
import type { ApiInterface } from '@/shared/types';

import { IntegrationBpmnEditor } from '@nebula-studio/nebula-flow-editor';
import { NebulaButton, NebulaDialog } from '@nebula-studio/nebula-ui';

defineProps<{
  atomicInterfaces: ApiInterface[];
  open: boolean;
  xml: string;
}>();

const emit = defineEmits<{
  close: [];
  submit: [];
  'update:xml': [value: string];
}>();
</script>

<template>
  <NebulaDialog
    :open="open"
    title="组合服务流程设计"
    size="full"
    @update:open="!$event && emit('close')"
  >
    <div class="bpmn-wrap">
      <IntegrationBpmnEditor
        :xml="xml"
        :atomic-interfaces="atomicInterfaces"
        @update:xml="emit('update:xml', $event)"
        @changed="() => {}"
      />
    </div>
    <div class="modal__actions">
      <NebulaButton variant="outline" @click="emit('close')">
        取消
      </NebulaButton>
      <NebulaButton @click="emit('submit')">保存流程</NebulaButton>
    </div>
  </NebulaDialog>
</template>

<style scoped>
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
