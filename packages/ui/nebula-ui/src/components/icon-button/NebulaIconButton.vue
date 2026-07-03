<script setup lang="ts">
import { computed } from 'vue';
import { Button, buttonVariants } from '../ui/button';
import { cn } from '../../utils/cn';
import { withTooltipAttrs } from '../../utils/tooltip';
import type { TooltipPlacement } from '../../utils/tooltip';

type NebulaVariant = 'default' | 'ghost' | 'muted';

const props = withDefaults(
  defineProps<{
    type?: string;
    variant?: NebulaVariant;
    active?: boolean;
    disabled?: boolean;
    class?: string;
    title?: string;
    tooltip?: string;
    tooltipPlacement?: TooltipPlacement;
    ariaLabel?: string;
  }>(),
  {
    type: 'button',
    variant: 'ghost',
    active: false,
    disabled: false,
    class: '',
    title: '',
    tooltip: '',
    tooltipPlacement: 'top',
    ariaLabel: '',
  },
);

defineEmits<{
  click: [event: MouseEvent];
}>();

const shadcnVariant = computed(() => {
  if (props.variant === 'muted') return 'ghost' as const;
  return props.variant as 'default' | 'ghost';
});
</script>

<template>
  <Button
    :type="type"
    :variant="shadcnVariant"
    size="icon"
    :disabled="disabled"
    :aria-label="ariaLabel || title || undefined"
    :title="title || undefined"
    :class="
      cn(
        buttonVariants({ variant: shadcnVariant, size: 'icon' }),
        active && 'bg-accent',
        props.class,
      )
    "
    v-bind="
      withTooltipAttrs(
        '',
        '',
        props.tooltip || props.title,
        props.tooltipPlacement,
      )
    "
    @click="$emit('click', $event)"
  >
    <slot />
  </Button>
</template>
