<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

import {
  RadioGroupIndicator,
  RadioGroupItem as RadioGroupItemRoot,
} from 'reka-ui';

import { cn } from '../../../utils/cn';

defineProps<{
  class?: HTMLAttributes['class'];
  disabled?: boolean;
  value: string;
}>();
</script>

<template>
  <RadioGroupItemRoot
    :value="value"
    :disabled="disabled"
    :class="
      cn(
        'nebula-radio aspect-square size-4 shrink-0 rounded-full border-2 border-primary bg-background text-primary shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50',
        $attrs.class as string,
      )
    "
  >
    <RadioGroupIndicator class="flex items-center justify-center">
      <div class="nebula-radio__dot h-2.5 w-2.5 rounded-full bg-primary"></div>
    </RadioGroupIndicator>
  </RadioGroupItemRoot>
</template>
