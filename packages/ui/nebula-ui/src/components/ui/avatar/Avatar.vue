<script lang="ts">
import { cn } from '../../../utils/cn';
import { AvatarRoot, AvatarImage, AvatarFallback } from 'reka-ui';
import type {
  AvatarRootProps,
  AvatarImageProps,
  AvatarFallbackProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

export type AvatarProps = AvatarRootProps & {
  class?: HTMLAttributes['class'];
};

export type AvatarImageComponentProps = AvatarImageProps & {
  class?: HTMLAttributes['class'];
};

export type AvatarFallbackComponentProps = AvatarFallbackProps & {
  class?: HTMLAttributes['class'];
};
</script>

<script setup lang="ts">
defineProps<AvatarProps>();
</script>

<template>
  <AvatarRoot
    :class="
      cn(
        'relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full',
        $attrs.class as string,
      )
    "
  >
    <slot />
  </AvatarRoot>
</template>
