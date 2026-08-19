<script setup lang="ts">
import type {
  DagDefinitionRecord,
  OrchestrationType,
  SubscriptionMode,
} from '@/shared/types';

import type { PublishForm } from '../../publish/types';

import { computed } from 'vue';

import {
  NebulaButton,
  NebulaDialog,
  NebulaInput,
  NebulaSelect,
} from '@nebula-studio/nebula-ui';

import {
  PUBLISH_ORCHESTRATION_OPTIONS,
  SUBSCRIPTION_MODE_OPTIONS,
} from '../../publish/types';

const props = defineProps<{
  dagOptions: DagDefinitionRecord[];
  form: PublishForm;
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
  orchestrationChange: [];
  submit: [];
  'update:form': [value: PublishForm];
}>();

const dagSelectOptions = computed(
  () =>
    [{ id: '', dagName: '请选择' }, ...props.dagOptions] as unknown as Array<
      Record<string, unknown>
    >,
);
</script>

<template>
  <NebulaDialog
    :open="open"
    title="发布配置"
    description="配置订阅与编排策略，发布后将同步至执行器集群。"
    @update:open="!$event && emit('close')"
  >
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
    <label class="field">
      <span>编排类型</span>
      <NebulaSelect
        :model-value="form.orchestrationType"
        :options="PUBLISH_ORCHESTRATION_OPTIONS"
        @update:model-value="
          emit('update:form', {
            ...form,
            orchestrationType: $event as OrchestrationType,
          });
          emit('orchestrationChange');
        "
      />
    </label>
    <label v-if="form.orchestrationType === 'BPMN'" class="field">
      <span>流程定义 ID（可选）</span>
      <NebulaInput
        :model-value="form.flowDefinitionId"
        placeholder="留空则使用服务内嵌 BPMN"
        @update:model-value="
          emit('update:form', {
            ...form,
            flowDefinitionId: String($event ?? ''),
          })
        "
      />
    </label>
    <label v-if="form.orchestrationType === 'DAG'" class="field">
      <span>绑定 DAG</span>
      <NebulaSelect
        :model-value="form.dagDefinitionId"
        :options="dagSelectOptions"
        label-key="dagName"
        value-key="id"
        @update:model-value="
          emit('update:form', {
            ...form,
            dagDefinitionId: String($event ?? ''),
          })
        "
      />
    </label>
    <div class="modal__actions">
      <NebulaButton variant="outline" @click="emit('close')">
        取消
      </NebulaButton>
      <NebulaButton @click="emit('submit')">确认发布</NebulaButton>
    </div>
  </NebulaDialog>
</template>

<style scoped>
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
