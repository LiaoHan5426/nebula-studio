<script setup lang="ts">
import { computed } from 'vue';
import {
  NebulaButton,
  NebulaInput,
  NebulaSelect,
} from '@nebula-studio/nebula-ui';

import type { ApiInterface } from '@/shared/types';

import type {
  CircuitBreakerRow,
  CircuitForm,
  GovernanceTab,
  RateLimitForm,
  WhitelistForm,
} from '../../governance/types';

const props = defineProps<{
  open: boolean;
  activeTab: GovernanceTab;
  title: string;
  rateLimitForm: RateLimitForm;
  circuitForm: CircuitForm;
  whitelistForm: WhitelistForm;
  manageableServices: ApiInterface[];
  editingCircuit: CircuitBreakerRow | null;
}>();

const emit = defineEmits<{
  close: [];
  submit: [];
  'update:rateLimitForm': [value: RateLimitForm];
  'update:circuitForm': [value: CircuitForm];
  'update:whitelistForm': [value: WhitelistForm];
}>();

const serviceSelectOptions = computed(
  () =>
    props.manageableServices.map((service) => ({
      interfaceId: service.interfaceId,
      interfaceName: service.interfaceName,
    })) as unknown as Array<Record<string, unknown>>,
);

const whitelistServiceOptions = computed(
  () =>
    [
      { interfaceId: '', interfaceName: '（租户级）' },
      ...props.manageableServices.map((service) => ({
        interfaceId: service.interfaceId,
        interfaceName: service.interfaceName,
      })),
    ] as unknown as Array<Record<string, unknown>>,
);
</script>

<template>
  <div v-if="open" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card">
      <h3>{{ title }}</h3>
      <div v-if="activeTab === 'rateLimit'" class="modal-form">
        <label class="modal-form__field">
          <span>规则名称</span>
          <NebulaInput
            :model-value="rateLimitForm.ruleName"
            placeholder="可选"
            @update:model-value="
              emit('update:rateLimitForm', {
                ...rateLimitForm,
                ruleName: String($event ?? ''),
              })
            "
          />
        </label>
        <label class="modal-form__field">
          <span>目标服务</span>
          <NebulaSelect
            :model-value="rateLimitForm.interfaceId"
            :options="serviceSelectOptions"
            label-key="interfaceName"
            value-key="interfaceId"
            @update:model-value="
              emit('update:rateLimitForm', {
                ...rateLimitForm,
                interfaceId: String($event ?? ''),
              })
            "
          />
        </label>
        <label class="modal-form__field">
          <span>窗口内最大请求数</span>
          <NebulaInput
            :model-value="rateLimitForm.maxRequests"
            type="number"
            @update:model-value="
              emit('update:rateLimitForm', {
                ...rateLimitForm,
                maxRequests: String($event ?? ''),
              })
            "
          />
        </label>
        <label class="modal-form__field">
          <span>窗口（秒）</span>
          <NebulaInput
            :model-value="rateLimitForm.windowSeconds"
            type="number"
            @update:model-value="
              emit('update:rateLimitForm', {
                ...rateLimitForm,
                windowSeconds: String($event ?? ''),
              })
            "
          />
        </label>
      </div>
      <div v-else-if="activeTab === 'circuitBreaker'" class="modal-form">
        <label class="modal-form__field">
          <span>目标服务</span>
          <NebulaSelect
            :model-value="circuitForm.interfaceId"
            :options="serviceSelectOptions"
            label-key="interfaceName"
            value-key="interfaceId"
            :disabled="!!editingCircuit"
            @update:model-value="
              emit('update:circuitForm', {
                ...circuitForm,
                interfaceId: String($event ?? ''),
              })
            "
          />
        </label>
        <label class="modal-form__field">
          <span>失败率阈值 (%)</span>
          <NebulaInput
            :model-value="circuitForm.failureRateThreshold"
            type="number"
            @update:model-value="
              emit('update:circuitForm', {
                ...circuitForm,
                failureRateThreshold: String($event ?? ''),
              })
            "
          />
        </label>
        <label class="modal-form__field">
          <span>慢调用率阈值 (%)</span>
          <NebulaInput
            :model-value="circuitForm.slowCallRateThreshold"
            type="number"
            @update:model-value="
              emit('update:circuitForm', {
                ...circuitForm,
                slowCallRateThreshold: String($event ?? ''),
              })
            "
          />
        </label>
        <label class="modal-form__field">
          <span>慢调用时长 (秒)</span>
          <NebulaInput
            :model-value="circuitForm.slowCallDurationSeconds"
            type="number"
            @update:model-value="
              emit('update:circuitForm', {
                ...circuitForm,
                slowCallDurationSeconds: String($event ?? ''),
              })
            "
          />
        </label>
        <label class="modal-form__field">
          <span>最小调用次数</span>
          <NebulaInput
            :model-value="circuitForm.minimumNumberOfCalls"
            type="number"
            @update:model-value="
              emit('update:circuitForm', {
                ...circuitForm,
                minimumNumberOfCalls: String($event ?? ''),
              })
            "
          />
        </label>
        <label class="modal-form__field">
          <span>熔断等待 (秒)</span>
          <NebulaInput
            :model-value="circuitForm.waitDurationSeconds"
            type="number"
            @update:model-value="
              emit('update:circuitForm', {
                ...circuitForm,
                waitDurationSeconds: String($event ?? ''),
              })
            "
          />
        </label>
      </div>
      <div v-else class="modal-form">
        <label class="modal-form__field">
          <span>规则名称</span>
          <NebulaInput
            :model-value="whitelistForm.ruleName"
            placeholder="可选"
            @update:model-value="
              emit('update:whitelistForm', {
                ...whitelistForm,
                ruleName: String($event ?? ''),
              })
            "
          />
        </label>
        <label class="modal-form__field">
          <span>目标服务（留空为租户级）</span>
          <NebulaSelect
            :model-value="whitelistForm.interfaceId"
            :options="whitelistServiceOptions"
            label-key="interfaceName"
            value-key="interfaceId"
            @update:model-value="
              emit('update:whitelistForm', {
                ...whitelistForm,
                interfaceId: String($event ?? ''),
              })
            "
          />
        </label>
        <label class="modal-form__field">
          <span>允许 IP（每行或逗号分隔）</span>
          <textarea
            :value="whitelistForm.whitelistIps"
            rows="4"
            @input="
              emit('update:whitelistForm', {
                ...whitelistForm,
                whitelistIps: ($event.target as HTMLTextAreaElement).value,
              })
            "
          />
        </label>
      </div>
      <div class="modal-card__actions">
        <NebulaButton variant="outline" @click="emit('close')"
          >取消</NebulaButton
        >
        <NebulaButton @click="emit('submit')">保存</NebulaButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 45%);
}

.modal-card {
  width: min(480px, calc(100vw - 32px));
  padding: 20px 24px;
  background: hsl(var(--card));
  border-radius: 10px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.modal-form__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.modal-form__field textarea {
  padding: 8px 10px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.modal-card__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
