<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import { TabsRoot, useForwardPropsEmits } from 'reka-ui';
import type { TabsRootEmits, TabsRootProps } from 'reka-ui';

interface TabsProps extends TabsRootProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<TabsProps>();
const emits = defineEmits<TabsRootEmits>();
const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <TabsRoot v-bind="forwarded">
    <slot />
  </TabsRoot>
</template>
