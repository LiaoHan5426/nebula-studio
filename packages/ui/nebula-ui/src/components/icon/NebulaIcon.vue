<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';
import { Icon } from '@iconify/vue';
import { cn } from '../../utils/cn';
import { resolveIcon, isHttpUrl, isIconifyName } from './preset';

const props = withDefaults(
  defineProps<{
    /** 图标来源：Vue 组件 | Iconify 名称 | HTTP URL | 内置简写名 */
    icon?: Component | string;
    /** 尺寸（Tailwind class 或 px 数值） */
    size?: string | number;
    /** 颜色（CSS 值或 Tailwind 语义色） */
    color?: string;
    /** 无图标时是否显示默认占位 */
    fallback?: boolean;
    /** 自定义 class */
    class?: string;
  }>(),
  {
    icon: '',
    size: '1em',
    color: 'currentColor',
    fallback: false,
    class: '',
  },
);

const sizeStyle = computed(() => {
  if (typeof props.size === 'number') return `${props.size}px`;
  // 如果是纯数字字符串，也加 px
  if (/^\d+$/.test(props.size)) return `${props.size}px`;
  return props.size;
});

const resolved = computed(() => {
  if (!props.icon) return null;

  // Vue 组件或 VNode
  if (typeof props.icon !== 'string') {
    return { type: 'component' as const, value: props.icon };
  }

  // 空字符串
  if (!props.icon) {
    return null;
  }

  // HTTP URL
  if (isHttpUrl(props.icon)) {
    return { type: 'url' as const, value: props.icon };
  }

  // 完整 Iconify 名称（含冒号）
  if (isIconifyName(props.icon)) {
    return { type: 'iconify' as const, value: props.icon };
  }

  // 使用预设解析
  const result = resolveIcon(props.icon);
  return { type: result.type as 'iconify', value: result.value };
});
</script>

<template>
  <!-- Vue 组件 -->
  <component
    :is="resolved?.value"
    v-if="resolved?.type === 'component'"
    :class="cn('inline-block shrink-0', props.class)"
    :style="{ width: sizeStyle, height: sizeStyle, color }"
  />

  <!-- HTTP URL 图片 -->
  <img
    v-else-if="resolved?.type === 'url'"
    :src="resolved.value"
    :class="cn('inline-block shrink-0 object-contain', props.class)"
    :style="{ width: sizeStyle, height: sizeStyle }"
    :alt="''"
    aria-hidden="true"
  />

  <!-- Iconify 图标 -->
  <Icon
    v-else-if="resolved?.type === 'iconify'"
    :icon="resolved.value"
    :class="cn('inline-block shrink-0', props.class)"
    :style="{ width: sizeStyle, height: sizeStyle, color }"
    aria-hidden="true"
  />

  <!-- Fallback 占位 -->
  <span
    v-else-if="fallback"
    :class="cn('inline-block shrink-0 rounded bg-muted', props.class)"
    :style="{ width: sizeStyle, height: sizeStyle }"
    aria-hidden="true"
  />
</template>
