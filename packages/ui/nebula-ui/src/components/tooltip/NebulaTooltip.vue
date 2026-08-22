<script setup lang="ts">
import type { TooltipPlacement } from '../../utils/tooltip';

import { computed } from 'vue';

import { withTooltipAttrs } from '../../utils/tooltip';

const props = withDefaults(
  defineProps<{
    class?: string;
    content: string;
    placement?: TooltipPlacement;
  }>(),
  {
    class: '',
    placement: 'top',
  },
);

const bind = computed(() =>
  withTooltipAttrs(
    'nebula-tooltip-wrap',
    props.class,
    props.content,
    props.placement,
  ),
);
</script>

<template>
  <span v-bind="bind">
    <slot></slot>
  </span>
</template>
