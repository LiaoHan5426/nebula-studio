<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import { cn } from '../../../utils/cn';

defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div :class="cn('rounded-md bg-primary/10', $attrs.class as string)" />
</template>
