<script setup lang="ts">
import { computed, ref } from 'vue';
import NebulaButton from '../button/NebulaButton.vue';
import { cn } from '../../utils/cn';

type PaginationAlign = 'start' | 'center' | 'end' | 'between';
type PaginationPart = 'total' | 'sizes' | 'pager' | 'jumper';

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
    align?: PaginationAlign;
    layout?: PaginationPart[];
    siblingCount?: number;
    class?: string;
  }>(),
  {
    modelValue: 1,
    total: 0,
    pageSize: 10,
    pageSizes: () => [10, 20, 50, 100],
    disabled: false,
    showSizeChanger: true,
    align: 'start',
    layout: () => ['total', 'sizes', 'pager'],
    siblingCount: 1,
    class: '',
  },
);

const emit = defineEmits<{
  'update:modelValue': [page: number];
  'update:pageSize': [size: number];
  change: [payload: { page: number; pageSize: number }];
}>();

const jumpPage = ref('');
const pageCount = computed(() =>
  Math.max(
    1,
    Math.ceil(Math.max(props.total, 0) / Math.max(props.pageSize, 1)),
  ),
);
const currentPage = computed(() => clamp(props.modelValue, 1, pageCount.value));
const visibleParts = computed(() =>
  props.layout.filter((part) => part !== 'sizes' || props.showSizeChanger),
);
const pages = computed<Array<number | 'ellipsis'>>(() => {
  if (pageCount.value <= 7) {
    return Array.from({ length: pageCount.value }, (_, index) => index + 1);
  }
  const radius = Math.max(1, props.siblingCount);
  const values = new Set<number>([1, pageCount.value]);
  for (
    let page = Math.max(2, currentPage.value - radius);
    page <= Math.min(pageCount.value - 1, currentPage.value + radius);
    page += 1
  ) {
    values.add(page);
  }
  const sorted = [...values].toSorted((a, b) => a - b);
  const result: Array<number | 'ellipsis'> = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && page - previous > 1) result.push('ellipsis');
    result.push(page);
  });
  return result;
});

function changePage(nextPage: number): void {
  const page = clamp(nextPage, 1, pageCount.value);
  emit('update:modelValue', page);
  emit('change', { page, pageSize: props.pageSize });
}

function changeSize(event: Event): void {
  const value = Number((event.target as HTMLSelectElement).value);
  if (!Number.isFinite(value) || value <= 0) return;
  emit('update:pageSize', value);
  const page = clamp(
    currentPage.value,
    1,
    Math.max(1, Math.ceil(props.total / value)),
  );
  emit('update:modelValue', page);
  emit('change', { page, pageSize: value });
}

function jump(): void {
  const page = Number(jumpPage.value);
  if (Number.isFinite(page)) changePage(page);
  jumpPage.value = '';
}
</script>

<template>
  <nav
    :class="cn('nebula-pagination', `nebula-pagination--${align}`, props.class)"
    aria-label="分页导航"
  >
    <template v-for="part in visibleParts" :key="part">
      <slot
        v-if="part === 'total'"
        name="total"
        :page="currentPage"
        :page-count="pageCount"
        :page-size="pageSize"
        :total="total"
      >
        <span class="nebula-pagination__summary">
          共 {{ total }} 条 · 第 {{ currentPage }}/{{ pageCount }} 页
        </span>
      </slot>

      <label v-else-if="part === 'sizes'" class="nebula-pagination__sizes">
        <span>每页</span>
        <select :disabled="disabled" :value="pageSize" @change="changeSize">
          <option v-for="size in pageSizes" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
        <span>条</span>
      </label>

      <div v-else-if="part === 'pager'" class="nebula-pagination__pager">
        <NebulaButton
          size="sm"
          variant="secondary"
          aria-label="上一页"
          :disabled="disabled || currentPage <= 1"
          @click="changePage(currentPage - 1)"
          >‹</NebulaButton
        >
        <template v-for="(page, index) in pages" :key="`${page}-${index}`">
          <span v-if="page === 'ellipsis'" class="nebula-pagination__ellipsis"
            >…</span
          >
          <NebulaButton
            v-else
            size="sm"
            :variant="page === currentPage ? 'primary' : 'ghost'"
            :aria-label="`第 ${page} 页`"
            :aria-current="page === currentPage ? 'page' : undefined"
            :disabled="disabled"
            @click="changePage(page)"
            >{{ page }}</NebulaButton
          >
        </template>
        <NebulaButton
          size="sm"
          variant="secondary"
          aria-label="下一页"
          :disabled="disabled || currentPage >= pageCount"
          @click="changePage(currentPage + 1)"
          >›</NebulaButton
        >
      </div>

      <form v-else class="nebula-pagination__jumper" @submit.prevent="jump">
        <span>前往</span>
        <input
          v-model="jumpPage"
          type="number"
          min="1"
          :max="pageCount"
          :disabled="disabled"
        />
        <span>页</span>
      </form>
    </template>
  </nav>
</template>

<style scoped>
.nebula-pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.nebula-pagination--start {
  justify-content: flex-start;
}

.nebula-pagination--center {
  justify-content: center;
}

.nebula-pagination--end {
  justify-content: flex-end;
}

.nebula-pagination--between {
  justify-content: space-between;
}

.nebula-pagination__summary,
.nebula-pagination__sizes,
.nebula-pagination__jumper {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.nebula-pagination__sizes select,
.nebula-pagination__jumper input {
  min-height: 32px;
  padding: 4px 8px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-sm, 6px);
}

.nebula-pagination__jumper input {
  width: 64px;
}

.nebula-pagination__pager {
  display: inline-flex;
  gap: 3px;
  align-items: center;
}

.nebula-pagination__pager :deep(.nebula-button-control) {
  min-width: 30px;
  padding-inline: 8px;
}

.nebula-pagination__ellipsis {
  display: inline-grid;
  place-items: center;
  width: 28px;
  color: hsl(var(--muted-foreground));
}
</style>
