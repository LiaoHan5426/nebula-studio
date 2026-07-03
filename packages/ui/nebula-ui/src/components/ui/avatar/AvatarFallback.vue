<script setup lang="ts">
import { cn } from '../../../utils/cn';
import { AvatarFallback } from 'reka-ui';
import type { AvatarFallbackProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

defineProps<AvatarFallbackProps & { class?: HTMLAttributes['class'] }>();
</script>

<template>
  <AvatarFallback
    v-bind="$props"
    :class="
      cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted',
        $attrs.class as string,
      )
    "
  >
    <slot />
  </AvatarFallback>
</template>
