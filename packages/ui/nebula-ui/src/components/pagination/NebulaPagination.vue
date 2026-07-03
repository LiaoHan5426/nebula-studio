<script setup lang="ts">
import { computed } from 'vue';
import NebulaButton from '../button/NebulaButton.vue';
import { cn } from '../../utils/cn';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const props = withDefaults(
  defineProps<{
    modelValue?: number;
    total?: number;
    pageSize?: number;
    pageSizes?: number[];
    disabled?: boolean;
    showSizeChanger?: boolean;
    class?: string;
  }>(),
  {
    modelValue: 1,
    total: 0,
    pageSize: 10,
    pageSizes: () => [10, 20, 50, 100],
    disabled: false,
    showSizeChanger: true,
    class: '',
  },
);

const emit = defineEmits<{
  'update:modelValue': [page: number];
  'update:pageSize': [size: number];
  change: [payload: { page: number; pageSize: number }];
}>();

const pageCount = computed(() =>
  Math.max(
    1,
    Math.ceil(Math.max(props.total, 0) / Math.max(props.pageSize, 1)),
  ),
);

const currentPage = computed(() => clamp(props.modelValue, 1, pageCount.value));

function changePage(nextPage: number): void {
  const page = clamp(nextPage, 1, pageCount.value);
  emit('update:modelValue', page);
  emit('change', { page, pageSize: props.pageSize });
}

function changeSize(event: Event): void {
  const value = Number((event.target as HTMLSelectElement).value);
  if (!Number.isFinite(value) || value <= 0) return;
  emit('update:pageSize', value);
  const nextPage = clamp(
    currentPage.value,
    1,
    Math.max(1, Math.ceil(props.total / value)),
  );
  emit('update:modelValue', nextPage);
  emit('change', { page: nextPage, pageSize: value });
}
</script>

<template>
  <div :class="cn('flex items-center gap-3', props.class)">
    <slot
      :page="currentPage"
      :page-count="pageCount"
      :page-size="pageSize"
      :total="total"
    >
      <span class="text-sm text-muted-foreground">
        Total {{ total }} | Page {{ currentPage }}/{{ pageCount }}
      </span>
    </slot>

    <label v-if="showSizeChanger" class="flex items-center gap-1.5 text-sm">
      <span class="text-muted-foreground">Page size</span>
      <select
        class="h-8 rounded-md border border-input bg-background px-2 text-sm"
        :disabled="disabled"
        :value="pageSize"
        @change="changeSize"
      >
        <option v-for="size in pageSizes" :key="size" :value="size">
          {{ size }}
        </option>
      </select>
    </label>

    <div class="flex items-center gap-1">
      <NebulaButton
        variant="secondary"
        :disabled="disabled || currentPage <= 1"
        @click="changePage(currentPage - 1)"
      >
        Prev
      </NebulaButton>
      <NebulaButton
        variant="secondary"
        :disabled="disabled || currentPage >= pageCount"
        @click="changePage(currentPage + 1)"
      >
        Next
      </NebulaButton>
    </div>
  </div>
</template>
