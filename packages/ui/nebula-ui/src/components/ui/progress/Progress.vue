<script lang="ts" setup>
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { ProgressRoot, ProgressIndicator } from 'reka-ui';
import type { ProgressRootProps } from 'reka-ui';
import { cn } from '../../../utils/cn';

const props = defineProps<
  ProgressRootProps & { class?: HTMLAttributes['class'] }
>();

const percentage = computed(() => {
  const value = props.modelValue ?? 0;
  const max = props.max ?? 100;
  return (value / max) * 100;
});
</script>

<template>
  <ProgressRoot
    v-bind="$props"
    :class="
      cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
        $attrs.class as string,
      )
    "
  >
    <ProgressIndicator
      class="h-full w-full flex-1 bg-primary transition-all"
      :style="{ transform: `translateX(-${100 - percentage}%)` }"
    />
  </ProgressRoot>
</template>
