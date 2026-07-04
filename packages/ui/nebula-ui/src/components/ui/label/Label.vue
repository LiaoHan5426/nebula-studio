<script lang="ts" setup>
import { cn } from '../../../utils/cn';
import type { HTMLAttributes } from 'vue';
import { Label } from 'reka-ui';
import type { LabelProps } from 'reka-ui';

const props = defineProps<LabelProps & { class?: HTMLAttributes['class'] }>();
</script>

<template>
  <Label
    v-bind="props"
    :class="
      cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        $attrs.class as string,
      )
    "
  >
    <slot />
  </Label>
</template>
