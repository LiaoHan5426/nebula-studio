<script setup lang="ts">
import { computed } from 'vue';
import {
  NebulaButton,
  NebulaInput,
  NebulaPane,
  NebulaSelect,
} from '@nebula-studio/nebula-ui';

import type {
  DagDefinitionRecord,
  OrchestrationType,
  SubscriptionMode,
} from '@/shared/types';

import type { PublishForm } from '../../publish/types';
import {
  PUBLISH_ORCHESTRATION_OPTIONS,
  SUBSCRIPTION_MODE_OPTIONS,
} from '../../publish/types';

const props = defineProps<{
  open: boolean;
  form: PublishForm;
  dagOptions: DagDefinitionRecord[];
}>();

const emit = defineEmits<{
  close: [];
  submit: [];
  orchestrationChange: [];
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
  <div v-if="open" class="modal-overlay" @click.self="emit('close')">
    <NebulaPane title="发布配置" class="modal">
      <p class="publish-hint">配置订阅与编排策略，发布后将同步至执行器集群。</p>
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
        <NebulaButton variant="outline" @click="emit('close')"
          >取消</NebulaButton
        >
        <NebulaButton @click="emit('submit')">确认发布</NebulaButton>
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

.publish-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}
</style>
