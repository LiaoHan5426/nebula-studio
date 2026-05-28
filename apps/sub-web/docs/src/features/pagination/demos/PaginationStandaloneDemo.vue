<script setup lang="ts">
import { computed, ref } from 'vue';
import { NebulaButton, NebulaPagination } from '@nebula-studio/nebula-ui';
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
import paginationStandaloneDemoCode from './pagination-standalone-demo.code.md?raw';

const total = ref(87);
const page = ref(1);
const pageSize = ref(10);

const preset = ref<'compact' | 'wide'>('compact');
const pageSizes = computed(() =>
  preset.value === 'compact' ? [5, 10, 20] : [10, 20, 50, 100],
);

const disabled = ref(false);
const showSizeChanger = ref(true);

const code = paginationStandaloneDemoCode;
</script>

<template>
  <section id="pagination-standalone">
    <DocsDemoSection
      title="NebulaPagination 独立使用"
      description="不依赖表格：调节 total、pageSizes 预设、disabled、showSizeChanger，观察摘要与按钮禁用态。"
      :code="code"
    >
      <div class="pagination-standalone">
        <div class="pagination-standalone__toolbar">
          <label class="pagination-standalone__field">
            <span>total</span>
            <input
              v-model.number="total"
              class="pagination-standalone__input"
              type="number"
              min="0"
              step="1"
            />
          </label>
          <NebulaButton
            variant="ghost"
            @click="preset = preset === 'compact' ? 'wide' : 'compact'"
          >
            pageSizes：{{
              preset === 'compact' ? '5 / 10 / 20' : '10 / 20 / 50 / 100'
            }}
          </NebulaButton>
          <label class="pagination-standalone__check">
            <input v-model="disabled" type="checkbox" />
            disabled
          </label>
          <label class="pagination-standalone__check">
            <input v-model="showSizeChanger" type="checkbox" />
            showSizeChanger
          </label>
        </div>
        <NebulaPagination
          v-model="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="pageSizes"
          :disabled="disabled"
          :show-size-changer="showSizeChanger"
          class="pagination-standalone__pager"
        />
        <p class="pagination-standalone__state">
          v-model：page = {{ page }}，pageSize = {{ pageSize }}
        </p>
      </div>
    </DocsDemoSection>
  </section>
</template>

<style lang="scss" scoped>
.pagination-standalone {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pagination-standalone__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem 1rem;
  align-items: center;
  font-size: 0.88rem;
  color: hsl(var(--foreground));
}

.pagination-standalone__field {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
}

.pagination-standalone__input {
  width: 5rem;
  padding: 0.25rem 0.4rem;
  color: inherit;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.pagination-standalone__check {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
}

.pagination-standalone__pager {
  align-self: flex-start;
}

.pagination-standalone__state {
  margin: 0;
  font-size: 0.84rem;
  color: hsl(var(--muted-foreground));
}
</style>
