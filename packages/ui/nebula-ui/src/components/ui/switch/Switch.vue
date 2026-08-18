<script lang="ts" setup>
import type { SwitchRootEmits, SwitchRootProps } from 'reka-ui';

import type { HTMLAttributes } from 'vue';

import { SwitchRoot, SwitchThumb, useForwardPropsEmits } from 'reka-ui';

import { cn } from '../../../utils/cn';

interface SwitchProps extends SwitchRootProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SwitchProps>();
const emits = defineEmits<SwitchRootEmits>();
const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <SwitchRoot
    v-bind="forwarded"
    :class="
      cn(
        'nebula-switch peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        $attrs.class as string,
      )
    "
  >
    <SwitchThumb
      :class="
        cn(
          'nebula-switch__thumb pointer-events-none block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        )
      "
    />
  </SwitchRoot>
</template>
