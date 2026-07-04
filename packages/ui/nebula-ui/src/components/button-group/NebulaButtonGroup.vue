<script setup lang="ts">
import { ButtonGroup } from '../ui/button-group';
import { cn } from '../../utils/cn';

const props = defineProps<{
  orientation?: 'horizontal' | 'vertical';
  class?: string;
}>();
</script>

<template>
  <ButtonGroup
    :orientation="orientation"
    :class="cn('items-stretch', props.class)"
  >
    <slot />
  </ButtonGroup>
</template>
