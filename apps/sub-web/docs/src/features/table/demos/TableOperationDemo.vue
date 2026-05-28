<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  NebulaButton,
  NebulaTable,
  NebulaTableColumn,
} from '@nebula-studio/nebula-ui';
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
import tableOperationDemoCode from './table-operation-demo.code.md?raw';
import { createTableDemoRows } from './tableDemoData';
import type { DemoRow } from './tableDemoData';

const allRows = ref(createTableDemoRows());
const previewRows = computed(() => allRows.value.slice(0, 5));
const lastAction = ref('尚未执行操作');

function onInspect(row: DemoRow): void {
  lastAction.value = `Inspect ${row.module}`;
}

function onDisable(row: DemoRow): void {
  lastAction.value = `Disable ${row.module}`;
}

const code = tableOperationDemoCode;
</script>

<template>
  <section id="table-action">
    <DocsDemoSection
      title="操作列示例（Action Column）"
      description="通过列默认插槽渲染按钮，用于查看详情、切换状态等业务动作。"
      :code="code"
    >
      <div class="table-demo-wrap">
        <NebulaTable :data="previewRows">
          <NebulaTableColumn field="module" title="Module" min-width="180" />
          <NebulaTableColumn field="status" title="Status" width="120" />
          <NebulaTableColumn title="Action" width="220">
            <template #default="{ row }">
              <div class="table-actions">
                <NebulaButton
                  variant="secondary"
                  @click="onInspect(row as DemoRow)"
                >
                  Inspect
                </NebulaButton>
                <NebulaButton
                  variant="ghost"
                  @click="onDisable(row as DemoRow)"
                >
                  Disable
                </NebulaButton>
              </div>
            </template>
          </NebulaTableColumn>
        </NebulaTable>
      </div>
      <p class="table-action-log">Last Action: {{ lastAction }}</p>
    </DocsDemoSection>
  </section>
</template>

<style lang="scss" scoped>
.table-demo-wrap {
  width: 100%;
  max-width: 100%;
  overflow: auto hidden;
}

.table-demo-wrap :deep(.nebula-table),
.table-demo-wrap :deep(.vxe-table) {
  width: 100%;
  min-width: 640px;
}

.table-actions {
  display: inline-flex;
  gap: 0.45rem;
  align-items: center;
}

.table-action-log {
  margin: 0.7rem 0 0;
  font-size: 0.84rem;
  color: hsl(var(--muted-foreground));
}
</style>
