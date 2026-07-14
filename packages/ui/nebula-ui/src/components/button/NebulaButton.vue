<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '../ui/button';
import type { ButtonVariants } from '../ui/button';
import { cn } from '../../utils/cn';
import { withTooltipAttrs } from '../../utils/tooltip';
import type { TooltipPlacement } from '../../utils/tooltip';

type NebulaVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

const props = withDefaults(
  defineProps<{
    type?: string;
    variant?: NebulaVariant;
    /** 图标按钮模式：使用 size="icon" 并自动设置紧凑尺寸 */
    icon?: boolean;
    active?: boolean;
    disabled?: boolean;
    class?: string;
    title?: string;
    ariaLabel?: string;
    tooltip?: string;
    tooltipPlacement?: TooltipPlacement;
  }>(),
  {
    type: 'button',
    variant: 'secondary',
    icon: false,
    active: false,
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

const resolvedSize = computed(() => (props.icon ? 'icon' : 'default'));
</script>

<template>
  <Button
    :variant="shadcnVariant"
    :size="resolvedSize"
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
    <slot />
  </Button>
</template>
