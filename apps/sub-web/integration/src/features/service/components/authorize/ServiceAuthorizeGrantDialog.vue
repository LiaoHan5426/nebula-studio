<script setup lang="ts">
import { NebulaButton } from '@nebula-studio/nebula-ui';

import { GRANT_SCHEDULE_OPTIONS } from '@/shared/grant/schedule';

import type { AuthorizeRow, GrantForm } from '../../authorize/types';

defineProps<{
  open: boolean;
  title: string;
  target: AuthorizeRow | null;
  form: GrantForm;
  actingId: string | null;
}>();

const emit = defineEmits<{
  close: [];
  submit: [];
  'update:form': [value: GrantForm];
}>();
</script>

<template>
  <div v-if="open && target" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card">
      <h3 class="modal-card__title">{{ title }}</h3>
      <p class="modal-card__subtitle">
        {{ target.serviceName }}（{{ target.serviceId }}）
      </p>
      <div class="modal-form">
        <label class="modal-form__field">
          <span>有效期（可选）</span>
          <input
            :value="form.expiresAt"
            type="datetime-local"
            @input="
              emit('update:form', {
                ...form,
                expiresAt: ($event.target as HTMLInputElement).value,
              })
            "
          />
        </label>
        <label class="modal-form__field">
          <span>服务时间段</span>
          <select
            :value="form.scheduleType"
            @change="
              emit('update:form', {
                ...form,
                scheduleType: ($event.target as HTMLSelectElement)
                  .value as GrantForm['scheduleType'],
              })
            "
          >
            <option
              v-for="opt in GRANT_SCHEDULE_OPTIONS"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </label>
        <label
          v-if="form.scheduleType !== 'ALWAYS'"
          class="modal-form__field modal-form__field--inline"
        >
          <input
            :checked="form.enableTimeWindow"
            type="checkbox"
            @change="
              emit('update:form', {
                ...form,
                enableTimeWindow: ($event.target as HTMLInputElement).checked,
              })
            "
          />
          <span>限制日内时段（如 08:00-20:00）</span>
        </label>
        <div
          v-if="form.scheduleType !== 'ALWAYS' && form.enableTimeWindow"
          class="modal-form__row"
        >
          <label class="modal-form__field">
            <span>开始时间</span>
            <input
              :value="form.scheduleStartTime"
              type="time"
              @input="
                emit('update:form', {
                  ...form,
                  scheduleStartTime: ($event.target as HTMLInputElement).value,
                })
              "
            />
          </label>
          <label class="modal-form__field">
            <span>结束时间</span>
            <input
              :value="form.scheduleEndTime"
              type="time"
              @input="
                emit('update:form', {
                  ...form,
                  scheduleEndTime: ($event.target as HTMLInputElement).value,
                })
              "
            />
          </label>
        </div>
        <label class="modal-form__field">
          <span>总调用次数（可选，留空不限）</span>
          <input
            :value="form.maxCalls"
            type="number"
            min="1"
            placeholder="例如 10000"
            @input="
              emit('update:form', {
                ...form,
                maxCalls: ($event.target as HTMLInputElement).value,
              })
            "
          />
        </label>
        <label class="modal-form__field">
          <span>调用频率 - 窗口内最大次数（可选）</span>
          <input
            :value="form.rateLimitMax"
            type="number"
            min="1"
            placeholder="例如 100"
            @input="
              emit('update:form', {
                ...form,
                rateLimitMax: ($event.target as HTMLInputElement).value,
              })
            "
          />
        </label>
        <label class="modal-form__field">
          <span>频率窗口（秒）</span>
          <input
            :value="form.rateLimitWindowSeconds"
            type="number"
            min="1"
            placeholder="60"
            @input="
              emit('update:form', {
                ...form,
                rateLimitWindowSeconds: ($event.target as HTMLInputElement)
                  .value,
              })
            "
          />
        </label>
      </div>
      <div class="modal-card__actions">
        <NebulaButton variant="outline" @click="emit('close')">
          取消
        </NebulaButton>
        <NebulaButton
          :disabled="actingId === target.serviceId"
          @click="emit('submit')"
        >
          确认
        </NebulaButton>
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
  width: min(440px, calc(100vw - 32px));
  padding: 20px 24px;
  background: hsl(var(--card));
  border-radius: 10px;
  box-shadow: 0 8px 32px rgb(0 0 0 / 20%);
}

.modal-card__title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
}

.modal-card__subtitle {
  margin: 0 0 16px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-form__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.modal-form__field input,
.modal-form__field select {
  padding: 8px 10px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.modal-form__field--inline {
  flex-direction: row;
  gap: 8px;
  align-items: center;
}

.modal-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.modal-card__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
