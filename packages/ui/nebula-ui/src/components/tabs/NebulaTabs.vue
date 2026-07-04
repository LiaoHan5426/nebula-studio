<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import type { NebulaTabItem } from './types';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    tabs?: NebulaTabItem[];
    class?: string;
    listClass?: string;
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
    <slot />
  </Tabs>
</template>
