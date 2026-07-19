<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
  TooltipPortal,
} from 'reka-ui';
import type { TooltipRootProps, TooltipContentProps } from 'reka-ui';
import { cn } from '../../../utils/cn';

defineProps<
  TooltipRootProps &
    TooltipContentProps & {
      class?: HTMLAttributes['class'];
      content?: string;
    }
>();
</script>

<template>
  <TooltipProvider>
    <TooltipRoot v-bind="$props">
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          :side="side || 'top'"
          :side-offset="sideOffset ?? 4"
          :class="
            cn(
              'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              $attrs.class as string,
            )
          "
        >
          <slot name="content">
            {{ content }}
          </slot>
          <TooltipArrow class="fill-primary" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
