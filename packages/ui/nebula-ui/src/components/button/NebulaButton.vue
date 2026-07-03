<script setup lang="ts">
import { computed } from 'vue';
import { Button, buttonVariants } from '../ui/button';
import type { ButtonVariants } from '../ui/button';
import { cn } from '../../utils/cn';
import { withTooltipAttrs } from '../../utils/tooltip';
import type { TooltipPlacement } from '../../utils/tooltip';

type NebulaVariant = 'primary' | 'secondary' | 'ghost';

const props = withDefaults(
  defineProps<{
    type?: string;
    variant?: NebulaVariant;
    active?: boolean;
    disabled?: boolean;
    class?: string;
    tooltip?: string;
    tooltipPlacement?: TooltipPlacement;
  }>(),
  {
    type: 'button',
    variant: 'secondary',
    active: false,
    disabled: false,
    class: '',
    tooltip: '',
    tooltipPlacement: 'top',
  },
);

defineEmits<{
  click: [event: MouseEvent];
}>();

const shadcnVariant = computed(() => {
  const map: Record<NebulaVariant, ButtonVariants['variant']> = {
    primary: 'default',
    secondary: 'secondary',
    ghost: 'ghost',
  };
  return map[props.variant];
});
</script>

<template>
  <Button
    :variant="shadcnVariant"
    :class="
      cn(
        buttonVariants({ variant: shadcnVariant }),
        props.active && 'bg-accent',
        props.class,
      )
    "
    v-bind="withTooltipAttrs('', '', props.tooltip, props.tooltipPlacement)"
    :disabled="disabled"
    :type="type"
    @click="$emit('click', $event)"
  >
    <slot />
  </Button>
</template>
