<script lang="ts" setup>
import { cn } from '../../../utils/cn';
import type { HTMLAttributes } from 'vue';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <h3 :class="cn('font-semibold leading-none tracking-tight', props.class)">
    <slot />
  </h3>
</template>
