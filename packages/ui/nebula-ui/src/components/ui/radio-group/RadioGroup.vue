<script lang="ts" setup>
import type { RadioGroupRootEmits, RadioGroupRootProps } from 'reka-ui';

import type { HTMLAttributes } from 'vue';

import { RadioGroupRoot, useForwardPropsEmits } from 'reka-ui';

import { cn } from '../../../utils/cn';

interface RadioGroupProps extends RadioGroupRootProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<RadioGroupProps>();
const emits = defineEmits<RadioGroupRootEmits>();
const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <RadioGroupRoot
    v-bind="forwarded"
    :class="cn('nebula-radio-group grid gap-2', $attrs.class as string)"
  >
    <slot></slot>
  </RadioGroupRoot>
</template>
