<script lang="ts" setup>
import type { TooltipContentProps, TooltipRootProps } from 'reka-ui';

import type { HTMLAttributes } from 'vue';

import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'reka-ui';

import { cn } from '../../../utils/cn';

defineProps<
  TooltipContentProps &
    TooltipRootProps & {
      class?: HTMLAttributes['class'];
      content?: string;
    }
>();
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <TooltipRoot v-bind="$props">
      <TooltipTrigger as-child>
        <span class="nebula-tooltip-wrap">
          <slot></slot>
        </span>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          :side="side || 'top'"
          :side-offset="sideOffset ?? 4"
          :class="cn('nebula-tooltip', $attrs.class as string)"
        >
          <slot name="content">
            {{ content }}
          </slot>
          <TooltipArrow class="nebula-tooltip__arrow" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
