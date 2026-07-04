<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import { TabsList as TabsListRoot } from 'reka-ui';
import { cn } from '../../../utils/cn';

defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <TabsListRoot
    :class="
      cn(
        'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
        $attrs.class as string,
      )
    "
  >
    <slot />
  </TabsListRoot>
</template>
