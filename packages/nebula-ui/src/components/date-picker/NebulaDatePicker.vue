<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

type DatePickerType = 'date' | 'datetime' | 'datetimerange';

defineOptions({
  name: 'NebulaDatePicker',
});

const props = withDefaults(
  defineProps<{
    modelValue?: string | [string, string] | null;
    type?: DatePickerType;
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    type: 'date',
    placeholder: '',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string | [string, string] | null];
  change: [value: string | [string, string] | null];
}>();

const root = ref<HTMLElement>();
const isOpen = ref(false);

const formattedValue = computed(() => {
  if (!props.modelValue) return '';
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.join(' - ');
  }
  return props.modelValue;
});

function openPicker(): void {
  if (props.disabled || isOpen.value) return;
  isOpen.value = true;
}

function closePicker(): void {
  isOpen.value = false;
}

function togglePicker(): void {
  if (isOpen.value) {
    closePicker();
  } else {
    openPicker();
  }
}

function handleInputChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  emit('update:modelValue', value || null);
  emit('change', value || null);
}

function handleRangeStartChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const startValue = target.value;
  if (Array.isArray(props.modelValue)) {
    emit('update:modelValue', [startValue, props.modelValue[1]]);
    emit('change', [startValue, props.modelValue[1]]);
  } else {
    emit('update:modelValue', [startValue, '']);
    emit('change', [startValue, '']);
  }
}

function handleRangeEndChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const endValue = target.value;
  if (Array.isArray(props.modelValue)) {
    emit('update:modelValue', [props.modelValue[0], endValue]);
    emit('change', [props.modelValue[0], endValue]);
  } else {
    emit('update:modelValue', ['', endValue]);
    emit('change', ['', endValue]);
  }
}

function handleDocumentPointerDown(event: PointerEvent): void {
  if (!root.value?.contains(event.target as Node)) {
    closePicker();
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown);
});
</script>

<template>
  <div
    ref="root"
    class="nebula-date-picker"
    :class="{
      'nebula-date-picker--open': isOpen,
      'nebula-date-picker--disabled': disabled,
    }"
  >
    <button
      type="button"
      class="nebula-date-picker__trigger"
      :disabled="disabled"
      @click="togglePicker"
    >
      <span class="nebula-date-picker__value">
        <span v-if="formattedValue">{{ formattedValue }}</span>
        <span v-else class="nebula-date-picker__placeholder">
          {{ placeholder || '选择日期' }}
        </span>
      </span>
      <span class="nebula-date-picker__icon">📅</span>
    </button>

    <Transition name="nebula-date-picker-pop">
      <div v-if="isOpen" class="nebula-date-picker__dropdown">
        <!-- 单日期选择 -->
        <template v-if="type !== 'datetimerange'">
          <input
            type="datetime-local"
            class="nebula-date-picker__input"
            :value="(modelValue as string) || ''"
            @change="handleInputChange"
            @click.stop
          />
        </template>
        <!-- 日期范围选择 -->
        <template v-else>
          <div class="nebula-date-picker__range">
            <div class="nebula-date-picker__range-item">
              <label class="nebula-date-picker__range-label">开始时间</label>
              <input
                type="datetime-local"
                class="nebula-date-picker__input"
                :value="Array.isArray(modelValue) ? modelValue[0] : ''"
                @change="handleRangeStartChange"
                @click.stop
              />
            </div>
            <div class="nebula-date-picker__range-separator">~</div>
            <div class="nebula-date-picker__range-item">
              <label class="nebula-date-picker__range-label">结束时间</label>
              <input
                type="datetime-local"
                class="nebula-date-picker__input"
                :value="Array.isArray(modelValue) ? modelValue[1] : ''"
                @change="handleRangeEndChange"
                @click.stop
              />
            </div>
          </div>
        </template>
        <div class="nebula-date-picker__actions">
          <button
            type="button"
            class="nebula-date-picker__btn"
            @click="closePicker"
          >
            取消
          </button>
          <button
            type="button"
            class="nebula-date-picker__btn nebula-date-picker__btn--primary"
            @click="closePicker"
          >
            确定
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.nebula-date-picker {
  position: relative;
  display: inline-block;
  min-width: 200px;
  color: hsl(var(--foreground));
}

.nebula-date-picker__trigger {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 34px;
  padding: 0.34rem 0.58rem;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.nebula-date-picker__trigger:hover {
  border-color: hsl(var(--primary) / 50%);
}

.nebula-date-picker__trigger:focus-visible {
  outline: none;
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 2px hsl(var(--primary) / 20%);
}

.nebula-date-picker__trigger:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.nebula-date-picker__value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nebula-date-picker__placeholder {
  color: hsl(var(--muted-foreground));
}

.nebula-date-picker__icon {
  font-size: 14px;
  flex-shrink: 0;
}

.nebula-date-picker__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 50;
  width: max-content;
  min-width: 100%;
  padding: 12px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 15%);
}

.nebula-date-picker__input {
  width: 100%;
  padding: 8px;
  font: inherit;
  font-size: 13px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.nebula-date-picker__input:focus {
  outline: none;
  border-color: hsl(var(--primary));
}

.nebula-date-picker__range {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.nebula-date-picker__range-item {
  flex: 1;
}

.nebula-date-picker__range-label {
  display: block;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-bottom: 4px;
}

.nebula-date-picker__range-separator {
  padding-bottom: 20px;
  color: hsl(var(--muted-foreground));
}

.nebula-date-picker__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid hsl(var(--border));
}

.nebula-date-picker__btn {
  padding: 6px 12px;
  font-size: 13px;
  background: transparent;
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.nebula-date-picker__btn:hover {
  background: hsl(var(--muted));
}

.nebula-date-picker__btn--primary {
  color: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.nebula-date-picker__btn--primary:hover {
  background: hsl(var(--primary) / 10%);
}

.nebula-date-picker-pop-enter-active,
.nebula-date-picker-pop-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.nebula-date-picker-pop-enter-from,
.nebula-date-picker-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
