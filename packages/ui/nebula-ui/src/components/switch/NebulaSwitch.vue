<script setup lang="ts">
import type { TooltipPlacement } from '../../utils/tooltip';
import type { NebulaFormControlProps } from '../form/types';

import { useBooleanModel } from '../../composables/useBooleanModel';
import { cn } from '../../utils/cn';
import { withTooltipAttrs } from '../../utils/tooltip';
import { Switch } from '../ui/switch';

const props = withDefaults(
  defineProps<
    NebulaFormControlProps & {
      class?: string;
      label?: string;
      modelValue?: boolean;
      tooltip?: string;
      tooltipPlacement?: TooltipPlacement;
    }
  >(),
  {
    modelValue: false,
    label: '',
    class: '',
    tooltip: '',
    tooltipPlacement: 'top',
    id: '',
    name: '',
    required: false,
    invalid: false,
    ariaDescribedby: '',
    ariaLabelledby: '',
  },
);

const emit = defineEmits<{
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
  'update:modelValue': [value: boolean];
}>();

const model = useBooleanModel(
  () => props.modelValue,
  (next) => emit('update:modelValue', next),
);
</script>

<template>
  <label
    :class="
      cn('nebula-control-label inline-flex items-center gap-2', props.class)
    "
    v-bind="withTooltipAttrs('', '', props.tooltip, props.tooltipPlacement)"
  >
    <Switch
      v-model="model"
      :id="props.id || undefined"
      :name="props.name || undefined"
      :required="props.required"
      :aria-invalid="props.invalid || undefined"
      :aria-describedby="props.ariaDescribedby || undefined"
      :aria-labelledby="props.ariaLabelledby || undefined"
      :data-invalid="props.invalid || undefined"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />
    <span v-if="props.label" class="text-sm font-medium">
      {{ props.label }}
    </span>
  </label>
</template>

<style scoped>
label :deep([data-invalid='true']) {
  box-shadow: 0 0 0 2px hsl(var(--destructive) / 35%);
}
</style>
