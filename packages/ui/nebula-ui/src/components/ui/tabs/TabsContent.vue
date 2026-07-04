<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import { TabsContent as TabsContentRoot } from 'reka-ui';
import { cn } from '../../../utils/cn';

defineProps<{
  value: string;
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <TabsContentRoot
    :value="value"
    :class="
      cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        $attrs.class as string,
      )
    "
  >
    <slot />
  </TabsContentRoot>
</template>
