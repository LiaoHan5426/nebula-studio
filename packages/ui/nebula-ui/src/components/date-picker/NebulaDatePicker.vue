<script setup lang="ts">
import { computed } from 'vue';
import type { NebulaFormControlProps } from '../form/types';

type DatePickerType = 'date' | 'datetime' | 'datetimerange';
type DatePickerValue = string | [string, string] | null;

defineOptions({ name: 'NebulaDatePicker' });

const props = withDefaults(
  defineProps<
    NebulaFormControlProps & {
      modelValue?: DatePickerValue;
      type?: DatePickerType;
      placeholder?: string;
      disabled?: boolean;
      min?: string;
      max?: string;
    }
  >(),
  {
    modelValue: null,
    type: 'date',
    placeholder: '选择日期',
    disabled: false,
    min: '',
    max: '',
    id: '',
    name: '',
    required: false,
    invalid: false,
    ariaDescribedby: '',
    ariaLabelledby: '',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: DatePickerValue];
  change: [value: DatePickerValue];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();

const nativeType = computed(() =>
  props.type === 'date' ? 'date' : 'datetime-local',
);
const rangeValue = computed<[string, string]>(() =>
  Array.isArray(props.modelValue) ? props.modelValue : ['', ''],
);

function commit(value: DatePickerValue): void {
  emit('update:modelValue', value);
  emit('change', value);
}

function updateSingle(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  commit(value || null);
}

function updateRange(index: 0 | 1, event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  const next: [string, string] = [...rangeValue.value];
  next[index] = value;
  commit(next[0] || next[1] ? next : null);
}
</script>

<template>
  <div
    class="nebula-date-picker"
    :class="{
      'nebula-date-picker--range': type === 'datetimerange',
      'nebula-date-picker--disabled': disabled,
      'nebula-date-picker--invalid': invalid,
    }"
  >
    <template v-if="type === 'datetimerange'">
      <label class="nebula-date-picker__field">
        <span class="nebula-date-picker__label">开始时间</span>
        <input
          :type="nativeType"
          :id="props.id || undefined"
          :name="props.name || undefined"
          class="nebula-date-picker__input"
          :value="rangeValue[0]"
          :disabled="disabled"
          :required="props.required"
          :aria-invalid="props.invalid || undefined"
          :aria-describedby="props.ariaDescribedby || undefined"
          :aria-labelledby="props.ariaLabelledby || undefined"
          :min="min || undefined"
          :max="rangeValue[1] || max || undefined"
          aria-label="开始时间"
          @change="updateRange(0, $event)"
          @blur="emit('blur', $event)"
          @focus="emit('focus', $event)"
        />
      </label>
      <span class="nebula-date-picker__separator" aria-hidden="true">至</span>
      <label class="nebula-date-picker__field">
        <span class="nebula-date-picker__label">结束时间</span>
        <input
          :type="nativeType"
          :id="props.id ? `${props.id}-end` : undefined"
          :name="props.name ? `${props.name}End` : undefined"
          class="nebula-date-picker__input"
          :value="rangeValue[1]"
          :disabled="disabled"
          :required="props.required"
          :aria-invalid="props.invalid || undefined"
          :aria-describedby="props.ariaDescribedby || undefined"
          :aria-labelledby="props.ariaLabelledby || undefined"
          :min="rangeValue[0] || min || undefined"
          :max="max || undefined"
          aria-label="结束时间"
          @change="updateRange(1, $event)"
          @blur="emit('blur', $event)"
          @focus="emit('focus', $event)"
        />
      </label>
    </template>
    <input
      v-else
      :type="nativeType"
      :id="props.id || undefined"
      :name="props.name || undefined"
      class="nebula-date-picker__input"
      :value="typeof modelValue === 'string' ? modelValue : ''"
      :disabled="disabled"
      :required="props.required"
      :aria-invalid="props.invalid || undefined"
      :aria-describedby="props.ariaDescribedby || undefined"
      :aria-labelledby="props.ariaLabelledby || undefined"
      :min="min || undefined"
      :max="max || undefined"
      :aria-label="placeholder"
      :title="placeholder"
      @change="updateSingle"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />
  </div>
</template>

<style scoped>
.nebula-date-picker {
  display: inline-flex;
  align-items: center;
  min-width: 210px;
  color: hsl(var(--foreground));
}

.nebula-date-picker--range {
  gap: 10px;
  min-width: min(100%, 480px);
  padding: 10px 12px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md, 8px);
}

.nebula-date-picker__field {
  display: grid;
  flex: 1;
  gap: 5px;
  min-width: 0;
}

.nebula-date-picker__label {
  font-size: 11px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
}

.nebula-date-picker__input {
  box-sizing: border-box;
  width: 100%;
  min-height: 38px;
  padding: 7px 10px;
  font: inherit;
  font-size: 13px;
  color: hsl(var(--foreground));
  outline: none;
  color-scheme: light dark;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md, 8px);
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.nebula-date-picker__input:hover:not(:disabled) {
  border-color: hsl(var(--primary) / 55%);
}

.nebula-date-picker__input:focus-visible {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 15%);
}

.nebula-date-picker--invalid .nebula-date-picker__input {
  border-color: hsl(var(--destructive));
  box-shadow: 0 0 0 2px hsl(var(--destructive) / 12%);
}

.nebula-date-picker__input:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.nebula-date-picker__separator {
  align-self: end;
  padding-bottom: 10px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

@media (max-width: 640px) {
  .nebula-date-picker--range {
    display: grid;
  }

  .nebula-date-picker__separator {
    display: none;
  }
}
</style>
