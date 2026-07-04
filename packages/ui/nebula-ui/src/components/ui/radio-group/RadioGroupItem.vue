<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import {
  RadioGroupItem as RadioGroupItemRoot,
  RadioGroupIndicator,
} from 'reka-ui';
import { cn } from '../../../utils/cn';

defineProps<{
  value: string;
  disabled?: boolean;
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <RadioGroupItemRoot
    :value="value"
    :disabled="disabled"
    :class="
      cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        $attrs.class as string,
      )
    "
  >
    <RadioGroupIndicator class="flex items-center justify-center">
      <div class="h-2.5 w-2.5 rounded-full bg-primary" />
    </RadioGroupIndicator>
  </RadioGroupItemRoot>
</template>
