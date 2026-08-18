<script lang="ts">
import type {
  AvatarFallbackProps,
  AvatarImageProps,
  AvatarRootProps,
} from 'reka-ui';

import type { HTMLAttributes } from 'vue';

import { AvatarRoot } from 'reka-ui';

import { cn } from '../../../utils/cn';

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
        'nebula-avatar relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full',
        $attrs.class as string,
      )
    "
  >
    <slot></slot>
  </AvatarRoot>
</template>
