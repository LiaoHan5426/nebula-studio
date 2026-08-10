<script setup lang="ts">
import type { TooltipPlacement } from '../../utils/tooltip';
import type { ButtonVariants } from '../ui/button';

import { computed } from 'vue';

import { cn } from '../../utils/cn';
import { withTooltipAttrs } from '../../utils/tooltip';
import { Button } from '../ui/button';

type NebulaVariant = 'ghost' | 'outline' | 'primary' | 'secondary';

const props = withDefaults(
  defineProps<{
    active?: boolean;
    ariaLabel?: string;
    class?: string;
    disabled?: boolean;
    /** 图标按钮模式：使用 size="icon" 并自动设置紧凑尺寸 */
    icon?: boolean;
    size?: ButtonVariants['size'];
    title?: string;
    tooltip?: string;
    tooltipPlacement?: TooltipPlacement;
    type?: string;
    variant?: NebulaVariant;
  }>(),
  {
    type: 'button',
    variant: 'secondary',
    icon: false,
    active: false,
    size: 'default',
    disabled: false,
    class: '',
    title: '',
    ariaLabel: '',
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
    outline: 'outline',
    ghost: 'ghost',
  };
  return map[props.variant];
});

const resolvedSize = computed(() => (props.icon ? 'icon' : props.size));
</script>

<template>
  <Button
    :variant="shadcnVariant"
    :size="resolvedSize"
    class="nebula-button"
    :data-variant="props.variant"
    :data-size="resolvedSize"
    data-button-group-item
    :class="cn(props.active && 'bg-accent', props.class)"
    v-bind="
      withTooltipAttrs(
        '',
        '',
        props.tooltip || props.title,
        props.tooltipPlacement,
      )
    "
    :disabled="disabled"
    :type="type"
    :title="title || undefined"
    :aria-label="ariaLabel || title || undefined"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </Button>
</template>
