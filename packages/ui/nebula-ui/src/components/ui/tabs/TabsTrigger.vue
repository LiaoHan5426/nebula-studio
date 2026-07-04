<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import { TabsTrigger as TabsTriggerRoot } from 'reka-ui';
import { cn } from '../../../utils/cn';

defineProps<{
  value: string;
  disabled?: boolean;
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <TabsTriggerRoot
    :value="value"
    :disabled="disabled"
    :class="
      cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
        $attrs.class as string,
      )
    "
  >
    <slot />
  </TabsTriggerRoot>
</template>
