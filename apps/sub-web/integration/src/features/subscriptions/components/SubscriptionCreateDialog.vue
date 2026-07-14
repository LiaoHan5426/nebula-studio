<script setup lang="ts">
import { NebulaButton, NebulaPane } from '@nebula-studio/nebula-ui';

import { SubscribeType } from '@/shared/types';
import type { DataSourceConfig } from '@/shared/types';

import type { CreateFormDraft, SubscriptionFormState } from '../types';

defineProps<{
  open: boolean;
  form: SubscriptionFormState;
  createDraft: CreateFormDraft;
  dataSources: DataSourceConfig[];
}>();

const emit = defineEmits<{
  close: [];
  submit: [];
  'update:form': [value: SubscriptionFormState];
  'update:create-draft': [value: CreateFormDraft];
}>();
</script>

<template>
  <div v-if="open" class="modal-overlay" @click.self="emit('close')">
    <NebulaPane title="新建订阅" class="modal">
      <label class="field">
        <span>数据源</span>
        <select
          :value="form.dataSourceId"
          class="field__select"
          @change="
            emit('update:form', {
              ...form,
              dataSourceId: ($event.target as HTMLSelectElement).value,
            })
          "
        >
          <option
            v-for="ds in dataSources"
            :key="ds.dataSourceId"
            :value="ds.dataSourceId"
          >
            {{ ds.name }} ({{ ds.dataSourceId }})
          </option>
        </select>
      </label>
      <label class="field">
        <span>表名</span>
        <input
          :value="form.tableName"
          @input="
            emit('update:form', {
              ...form,
              tableName: ($event.target as HTMLInputElement).value,
            })
          "
        />
      </label>
      <label class="field">
        <span>订阅类型</span>
        <select
          :value="form.subscribeType"
          class="field__select"
          @change="
            emit('update:form', {
              ...form,
              subscribeType: ($event.target as HTMLSelectElement)
                .value as SubscriptionFormState['subscribeType'],
            })
          "
        >
          <option :value="SubscribeType.POLLING">轮询</option>
          <option :value="SubscribeType.CDC">CDC</option>
          <option :value="SubscribeType.TRIGGER">触发器</option>
        </select>
      </label>
      <label v-if="form.subscribeType === SubscribeType.POLLING" class="field">
        <span>轮询间隔（秒）</span>
        <input
          :value="createDraft.pollingIntervalSec"
          type="number"
          min="1"
          max="300"
          @input="
            emit('update:create-draft', {
              ...createDraft,
              pollingIntervalSec: Number(
                ($event.target as HTMLInputElement).value,
              ),
            })
          "
        />
        <span class="field__hint">最小 1 秒，默认 2 秒</span>
      </label>
      <template v-if="form.subscribeType === SubscribeType.CDC">
        <label class="field field--checkbox">
          <input
            :checked="createDraft.cdcEnabled"
            type="checkbox"
            @change="
              emit('update:create-draft', {
                ...createDraft,
                cdcEnabled: ($event.target as HTMLInputElement).checked,
              })
            "
          />
          <span>启用 Debezium CDC（关闭则使用模拟 CDC）</span>
        </label>
        <label class="field">
          <span>监听表（逗号分隔，留空则使用上方表名）</span>
          <input
            :value="createDraft.cdcTablesInput"
            placeholder="public.demo_orders, public.demo_users"
            @input="
              emit('update:create-draft', {
                ...createDraft,
                cdcTablesInput: ($event.target as HTMLInputElement).value,
              })
            "
          />
        </label>
        <label class="field">
          <span>快照模式</span>
          <select
            :value="form.cdcConfig?.snapshotMode"
            class="field__select"
            @change="
              emit('update:form', {
                ...form,
                cdcConfig: {
                  ...form.cdcConfig!,
                  snapshotMode: ($event.target as HTMLSelectElement).value,
                },
              })
            "
          >
            <option value="initial">initial</option>
            <option value="never">never</option>
            <option value="no_data">no_data</option>
          </select>
        </label>
      </template>
      <div class="modal__actions">
        <NebulaButton variant="outline" @click="emit('close')"
          >取消</NebulaButton
        >
        <NebulaButton @click="emit('submit')">创建</NebulaButton>
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
  width: min(480px, 92vw);
}

.field {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
}

.field input,
.field__select {
  padding: 8px 10px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.field__hint {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.field--checkbox {
  display: flex;
  gap: 8px;
  align-items: center;
}

.field--checkbox input {
  width: auto;
}

.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
