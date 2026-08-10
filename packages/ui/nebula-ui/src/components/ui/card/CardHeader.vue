<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

import { cn } from '../../../utils/cn';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div :class="cn('flex flex-col space-y-1.5 p-6', props.class)">
    <slot></slot>
  </div>
</template>
