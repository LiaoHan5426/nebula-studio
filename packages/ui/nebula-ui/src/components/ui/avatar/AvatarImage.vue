<script setup lang="ts">
import { cn } from '../../../utils/cn';
import { AvatarImage } from 'reka-ui';
import type { AvatarImageProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

defineProps<AvatarImageProps & { class?: HTMLAttributes['class'] }>();
</script>

<template>
  <AvatarImage
    v-bind="$props"
    :class="cn('aspect-square h-full w-full', $attrs.class as string)"
  />
</template>
