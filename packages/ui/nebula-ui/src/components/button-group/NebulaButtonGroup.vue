<script setup lang="ts">
import { cn } from '../../utils/cn';
import { ButtonGroup } from '../ui/button-group';

const props = defineProps<{
  class?: string;
  orientation?: 'horizontal' | 'vertical';
}>();
</script>

<template>
  <ButtonGroup
    :orientation="orientation"
    :class="cn('items-stretch', props.class)"
  >
    <slot></slot>
  </ButtonGroup>
</template>
