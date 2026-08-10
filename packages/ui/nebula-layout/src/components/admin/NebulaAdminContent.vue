<script setup lang="ts">
defineProps<{
  compact?: boolean;
  horizontal?: boolean;
}>();
</script>

<template>
  <div
    class="nebula-layout-content-only"
    :class="{
      'is-compact': compact,
      'is-horizontal': horizontal,
    }"
  >
    <div v-if="$slots.subnav" class="nebula-layout-content-only__subnav">
      <slot name="subnav"></slot>
    </div>
    <div class="nebula-layout-content-only__body">
      <slot></slot>
    </div>
  </div>
</template>
