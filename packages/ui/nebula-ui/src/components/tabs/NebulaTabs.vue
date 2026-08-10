<script setup lang="ts">
import type { NebulaTabItem } from './types';

import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

const props = withDefaults(
  defineProps<{
    class?: string;
    listClass?: string;
    modelValue?: string;
    tabs?: NebulaTabItem[];
  }>(),
  {
    modelValue: '',
    tabs: () => [],
    class: '',
    listClass: '',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <Tabs
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event as string)"
    :class="props.class"
  >
    <TabsList :class="props.listClass">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :disabled="tab.disabled"
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
    <slot></slot>
  </Tabs>
</template>
