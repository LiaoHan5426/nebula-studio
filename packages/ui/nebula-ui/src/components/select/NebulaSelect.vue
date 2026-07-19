<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import type { ComponentPublicInstance } from 'vue';
import type { NebulaFormControlProps } from '../form/types';

type NebulaSelectPrimitive = string | number;
type NebulaSelectObjectOption = Readonly<Record<string, unknown>>;
type NebulaSelectOption = NebulaSelectPrimitive | NebulaSelectObjectOption;

type NormalizedOption = {
  disabled: boolean;
  index: number;
  label: string;
  option: NebulaSelectOption;
  value: unknown;
};

defineOptions({
  name: 'NebulaSelect',
});

const props = withDefaults(
  defineProps<
    NebulaFormControlProps & {
      modelValue?: unknown;
      options?: readonly NebulaSelectOption[];
      labelKey?: string;
      valueKey?: string;
      disabledKey?: string;
      placeholder?: string;
      disabled?: boolean;
      returnObject?: boolean;
      class?: string;
    }
  >(),
  {
    options: () => [],
    labelKey: 'label',
    valueKey: 'value',
    disabledKey: 'disabled',
    placeholder: 'Select',
    disabled: false,
    returnObject: false,
    id: '',
    name: '',
    required: false,
    invalid: false,
    ariaDescribedby: '',
    ariaLabelledby: '',
    class: '',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: unknown];
  change: [value: unknown, option: NebulaSelectOption];
  blur: [];
  focus: [];
}>();

const root = ref<HTMLElement>();
const trigger = ref<HTMLButtonElement>();
const optionElements = ref<HTMLElement[]>([]);
const isOpen = ref(false);
const activeIndex = ref(-1);

function isObjectOption(
  option: NebulaSelectOption,
): option is NebulaSelectObjectOption {
  return typeof option === 'object' && option !== null;
}

function readObjectValue(
  option: NebulaSelectObjectOption,
  key: string,
): unknown {
  return key
    .split('.')
    .reduce<unknown>(
      (value, part) =>
        typeof value === 'object' && value !== null
          ? (value as Record<string, unknown>)[part]
          : undefined,
      option,
    );
}

function optionValue(option: NebulaSelectOption): unknown {
  if (props.returnObject || !isObjectOption(option)) {
    return option;
  }

  const value = readObjectValue(option, props.valueKey);
  return value === undefined ? option : value;
}

function optionLabel(option: NebulaSelectOption): string {
  if (!isObjectOption(option)) {
    return String(option);
  }

  const label = readObjectValue(option, props.labelKey);
  if (label !== undefined && label !== null) {
    return String(label);
  }

  const value = readObjectValue(option, props.valueKey);
  return value === undefined || value === null ? '' : String(value);
}

function optionDisabled(option: NebulaSelectOption): boolean {
  if (!isObjectOption(option)) {
    return false;
  }

  return Boolean(readObjectValue(option, props.disabledKey));
}

const normalizedOptions = computed<NormalizedOption[]>(() =>
  props.options.map((option, index) => ({
    disabled: optionDisabled(option),
    index,
    label: optionLabel(option),
    option,
    value: optionValue(option),
  })),
);

const selectedOption = computed(() =>
  normalizedOptions.value.find((option) =>
    Object.is(option.value, props.modelValue),
  ),
);

const activeOption = computed(() =>
  activeIndex.value >= 0
    ? normalizedOptions.value[activeIndex.value]
    : undefined,
);

const hasSelection = computed(() => selectedOption.value !== undefined);

function firstEnabledIndex(): number {
  return normalizedOptions.value.findIndex((option) => !option.disabled);
}

function selectedOrFirstEnabledIndex(): number {
  if (selectedOption.value && !selectedOption.value.disabled) {
    return selectedOption.value.index;
  }

  return firstEnabledIndex();
}

function openSelect(): void {
  if (props.disabled || isOpen.value) return;

  isOpen.value = true;
  activeIndex.value = selectedOrFirstEnabledIndex();
  void nextTick(scrollActiveOptionIntoView);
}

function closeSelect(): void {
  isOpen.value = false;
  activeIndex.value = -1;
}

function toggleSelect(): void {
  if (isOpen.value) {
    closeSelect();
  } else {
    openSelect();
  }
}

function moveActive(direction: 1 | -1): void {
  const options = normalizedOptions.value;
  if (options.length === 0) return;

  let nextIndex = activeIndex.value;
  for (let offset = 0; offset < options.length; offset += 1) {
    nextIndex = (nextIndex + direction + options.length) % options.length;
    if (!options[nextIndex]?.disabled) {
      activeIndex.value = nextIndex;
      void nextTick(scrollActiveOptionIntoView);
      return;
    }
  }
}

function selectOption(option: NormalizedOption): void {
  if (option.disabled) return;

  emit('update:modelValue', option.value);
  emit('change', option.value, option.option);
  closeSelect();
  void nextTick(() => trigger.value?.focus());
}

function scrollActiveOptionIntoView(): void {
  optionElements.value[activeIndex.value]?.scrollIntoView({
    block: 'nearest',
  });
}

function setOptionElement(
  element: Element | ComponentPublicInstance | null,
  index: number,
): void {
  if (element instanceof HTMLElement) {
    optionElements.value[index] = element;
  }
}

function handleTriggerKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (!isOpen.value) {
      openSelect();
    } else {
      moveActive(1);
    }
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (!isOpen.value) {
      openSelect();
    } else {
      moveActive(-1);
    }
    return;
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    if (!isOpen.value) {
      openSelect();
      return;
    }

    if (activeOption.value) {
      selectOption(activeOption.value);
    }
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    closeSelect();
  }
}

function handleDocumentPointerDown(event: PointerEvent): void {
  if (!root.value?.contains(event.target as Node)) {
    closeSelect();
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown);
});

watch(
  normalizedOptions,
  () => {
    optionElements.value = [];
    if (isOpen.value) {
      activeIndex.value = selectedOrFirstEnabledIndex();
    }
  },
  { deep: true },
);

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) {
      closeSelect();
    }
  },
);
</script>

<template>
  <div
    ref="root"
    class="nebula-select"
    :class="{
      'nebula-select--open': isOpen,
      'nebula-select--disabled': disabled,
      'nebula-select--empty': !hasSelection,
      'nebula-select--invalid': invalid,
      [props.class]: Boolean(props.class),
    }"
  >
    <button
      ref="trigger"
      type="button"
      class="nebula-select__trigger"
      :disabled="disabled"
      :id="props.id || undefined"
      :name="props.name || undefined"
      :aria-required="props.required || undefined"
      :aria-invalid="props.invalid || undefined"
      :aria-describedby="props.ariaDescribedby || undefined"
      :aria-labelledby="props.ariaLabelledby || undefined"
      :data-invalid="props.invalid || undefined"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @blur="emit('blur')"
      @click="toggleSelect"
      @focus="emit('focus')"
      @keydown="handleTriggerKeydown"
    >
      <span class="nebula-select__value">
        <slot
          v-if="selectedOption"
          name="selected"
          :disabled="selectedOption.disabled"
          :index="selectedOption.index"
          :label="selectedOption.label"
          :option="selectedOption.option"
          :value="selectedOption.value"
        >
          {{ selectedOption.label }}
        </slot>
        <span v-else class="nebula-select__placeholder">
          {{ placeholder }}
        </span>
      </span>
      <span class="nebula-select__chevron" aria-hidden="true" />
    </button>

    <Transition name="nebula-select-pop">
      <div v-if="isOpen" class="nebula-select__dropdown">
        <div
          v-if="normalizedOptions.length > 0"
          class="nebula-select__list"
          role="listbox"
        >
          <button
            v-for="option in normalizedOptions"
            :key="option.index"
            :ref="(element) => setOptionElement(element, option.index)"
            type="button"
            class="nebula-select__option"
            :class="{
              'is-active': option.index === activeIndex,
              'is-selected': Object.is(option.value, modelValue),
            }"
            :aria-disabled="option.disabled"
            :aria-selected="Object.is(option.value, modelValue)"
            :disabled="option.disabled"
            role="option"
            @click="selectOption(option)"
            @mousemove="activeIndex = option.index"
          >
            <slot
              name="option"
              :disabled="option.disabled"
              :index="option.index"
              :label="option.label"
              :option="option.option"
              :selected="Object.is(option.value, modelValue)"
              :value="option.value"
            >
              {{ option.label }}
            </slot>
          </button>
        </div>
        <div v-else class="nebula-select__empty">No options</div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.nebula-select {
  position: relative;
  display: block;
  min-width: 180px;
  color: hsl(var(--foreground));
}

.nebula-select__trigger {
  display: inline-flex;
  gap: 0.55rem;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 34px;
  padding: 0.34rem 0.58rem 0.34rem 0.68rem;
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

.nebula-select__trigger:focus-visible {
  outline: none;
  border-color: hsl(var(--primary) / 70%);
  box-shadow: 0 0 0 3px hsl(var(--primary) / 18%);
}

.nebula-select--invalid .nebula-select__trigger {
  border-color: hsl(var(--destructive));
  box-shadow: 0 0 0 2px hsl(var(--destructive) / 12%);
}

.nebula-select__trigger:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.nebula-select__value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nebula-select__placeholder {
  color: hsl(var(--muted-foreground));
}

.nebula-select__chevron {
  flex: 0 0 auto;
  width: 7px;
  height: 7px;
  border-right: 1.5px solid currentcolor;
  border-bottom: 1.5px solid currentcolor;
  opacity: 0.7;
  transform: translateY(-2px) rotate(45deg);
  transition: transform 0.16s ease;
}

.nebula-select--open .nebula-select__chevron {
  transform: translateY(2px) rotate(225deg);
}

.nebula-select__dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  left: 0;
  z-index: 60;
  padding: 0.28rem;
  background: hsl(var(--popover, var(--card)));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  box-shadow: 0 12px 30px rgb(0 0 0 / 18%);
}

.nebula-select__list {
  display: grid;
  gap: 0.12rem;
  max-height: 240px;
  overflow-y: auto;
}

.nebula-select__option {
  width: 100%;
  min-height: 30px;
  padding: 0.34rem 0.45rem;
  font: inherit;
  color: hsl(var(--popover-foreground, var(--foreground)));
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 6px;
}

.nebula-select__option.is-active {
  background: hsl(var(--accent) / 52%);
}

.nebula-select__option.is-selected {
  font-weight: 600;
  color: hsl(var(--primary));
}

.nebula-select__option:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.nebula-select__empty {
  padding: 0.55rem;
  font-size: 0.82rem;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.nebula-select-pop-enter-active,
.nebula-select-pop-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}

.nebula-select-pop-enter-from,
.nebula-select-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
