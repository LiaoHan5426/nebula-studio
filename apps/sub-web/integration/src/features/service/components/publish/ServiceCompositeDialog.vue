<script setup lang="ts">
import {
  NebulaButton,
  NebulaInput,
  NebulaPane,
  NebulaSelect,
} from '@nebula-studio/nebula-ui';

import type {
  CompositeInterface,
  OrchestrationType,
  SubscriptionMode,
} from '@/shared/types';
import { InterfaceMethod } from '@/shared/types';

import {
  COMPOSITE_ORCHESTRATION_OPTIONS,
  SUBSCRIPTION_MODE_OPTIONS,
} from '../../publish/types';

defineProps<{
  open: boolean;
  form: Partial<CompositeInterface>;
}>();

const emit = defineEmits<{
  close: [];
  submit: [];
  'update:form': [value: Partial<CompositeInterface>];
}>();
</script>

<template>
  <div v-if="open" class="modal-overlay" @click.self="emit('close')">
    <NebulaPane
      :title="form.interfaceId ? '编辑组合服务' : '新建组合服务'"
      class="modal"
    >
      <label class="field">
        <span>服务名称</span>
        <NebulaInput
          :model-value="form.interfaceName"
          @update:model-value="
            emit('update:form', {
              ...form,
              interfaceName: String($event ?? ''),
            })
          "
        />
      </label>
      <label class="field">
        <span>端点 URI</span>
        <NebulaInput
          :model-value="form.endpointUri"
          @update:model-value="
            emit('update:form', { ...form, endpointUri: String($event ?? '') })
          "
        />
      </label>
      <label class="field">
        <span>方法</span>
        <NebulaSelect
          :model-value="form.method"
          :options="
            Object.values(InterfaceMethod).map((m) => ({
              value: m,
              label: m,
            }))
          "
          @update:model-value="
            emit('update:form', { ...form, method: $event as InterfaceMethod })
          "
        />
      </label>
      <label class="field">
        <span>编排类型</span>
        <NebulaSelect
          :model-value="form.orchestrationType"
          :options="COMPOSITE_ORCHESTRATION_OPTIONS"
          @update:model-value="
            emit('update:form', {
              ...form,
              orchestrationType: $event as OrchestrationType,
            })
          "
        />
      </label>
      <label class="field">
        <span>订阅模式</span>
        <NebulaSelect
          :model-value="form.subscriptionMode"
          :options="SUBSCRIPTION_MODE_OPTIONS"
          @update:model-value="
            emit('update:form', {
              ...form,
              subscriptionMode: $event as SubscriptionMode,
            })
          "
        />
      </label>
      <div class="modal__actions">
        <NebulaButton variant="outline" @click="emit('close')"
          >取消</NebulaButton
        >
        <NebulaButton @click="emit('submit')">
          {{
            form.orchestrationType === 'DAG'
              ? '下一步：设计 DAG'
              : '下一步：设计流程'
          }}
        </NebulaButton>
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

.modal {
  width: min(520px, 92vw);
}

.field {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
}

.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
