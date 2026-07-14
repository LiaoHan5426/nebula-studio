<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaInput,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
} from '@nebula-studio/nebula-ui';
import { versionApi } from '@/shared/api/consoleApi';
import type { VersionSnapshot } from '@/shared/types';

const snapshots = ref<VersionSnapshot[]>([]);
const loading = ref(false);
const resourceId = ref('');
const selectedSnapshot = ref<VersionSnapshot | null>(null);
const rollbackTarget = ref<VersionSnapshot | null>(null);

function formatTime(iso: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('zh-CN');
}

function formatJson(raw: string): string {
  if (!raw) return '-';
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

async function loadSnapshots() {
  if (!resourceId.value) {
    snapshots.value = [];
    return;
  }
  loading.value = true;
  try {
    const res = await versionApi.listSnapshots(resourceId.value);
    snapshots.value = res.data ?? [];
  } catch {
    snapshots.value = [];
  } finally {
    loading.value = false;
  }
}

function viewDetail(snap: VersionSnapshot) {
  selectedSnapshot.value = snap;
}

function requestRollback(snap: VersionSnapshot) {
  rollbackTarget.value = snap;
}

async function confirmRollback() {
  if (!rollbackTarget.value) return;
  try {
    await versionApi.rollback(rollbackTarget.value.versionId, 'admin');
    rollbackTarget.value = null;
    await loadSnapshots();
  } catch (e) {
    console.error('Rollback failed:', e);
  }
}

onMounted(() => {
  /* 需要用户输入资源 ID 后手动查询 */
});
</script>

<template>
  <div class="page">
    <NebulaPane
      title="版本管理"
      description="按资源 ID 查询版本快照，支持查看详情与回滚"
    >
      <div class="page__toolbar">
        <NebulaInput
          v-model="resourceId"
          placeholder="输入资源 ID 查询"
          class="version-page__search"
          @keydown.enter="loadSnapshots"
        />
        <NebulaButton variant="primary" @click="loadSnapshots"
          >查询</NebulaButton
        >
      </div>

      <div class="page__table-wrap">
        <NebulaTable
          :data="snapshots"
          :loading="loading"
          :scroll-x="{ enabled: false }"
          row-key="versionId"
        >
          <NebulaTableColumn
            field="versionId"
            title="版本 ID"
            min-width="140"
            show-overflow="tooltip"
          />
          <NebulaTableColumn
            field="resourceId"
            title="资源 ID"
            min-width="140"
            show-overflow="tooltip"
          />
          <NebulaTableColumn field="label" title="标签" width="120">
            <template #default="{ row }">
              {{ row.label || '-' }}
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn field="createdBy" title="创建者" width="120">
            <template #default="{ row }">
              {{ row.createdBy || '-' }}
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn field="createdAt" title="创建时间" width="160">
            <template #default="{ row }">
              {{ formatTime(row.createdAt) }}
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn title="操作" width="160">
            <template #default="{ row }">
              <div class="row-actions">
                <NebulaButton
                  variant="outline"
                  size="sm"
                  @click="viewDetail(row)"
                >
                  详情
                </NebulaButton>
                <NebulaButton
                  variant="outline"
                  size="sm"
                  @click="requestRollback(row)"
                >
                  回滚
                </NebulaButton>
              </div>
            </template>
          </NebulaTableColumn>
        </NebulaTable>
      </div>
    </NebulaPane>

    <div
      v-if="rollbackTarget"
      class="modal-overlay"
      @click.self="rollbackTarget = null"
    >
      <NebulaPane title="确认回滚" class="modal">
        <p class="field-hint">
          确认回滚到版本 {{ rollbackTarget.versionId }}？
        </p>
        <div class="modal__actions">
          <NebulaButton variant="outline" @click="rollbackTarget = null">
            取消
          </NebulaButton>
          <NebulaButton variant="primary" @click="confirmRollback">
            确认
          </NebulaButton>
        </div>
      </NebulaPane>
    </div>

    <div
      v-if="selectedSnapshot"
      class="modal-overlay"
      @click.self="selectedSnapshot = null"
    >
      <NebulaPane title="快照详情" class="modal modal--large">
        <dl class="version-detail">
          <dt>版本 ID</dt>
          <dd>{{ selectedSnapshot.versionId }}</dd>
          <dt>资源 ID</dt>
          <dd>{{ selectedSnapshot.resourceId }}</dd>
          <dt>标签</dt>
          <dd>{{ selectedSnapshot.label || '-' }}</dd>
          <dt>创建者</dt>
          <dd>{{ selectedSnapshot.createdBy || '-' }}</dd>
          <dt>创建时间</dt>
          <dd>{{ formatTime(selectedSnapshot.createdAt) }}</dd>
        </dl>
        <label class="field">
          <span>快照内容</span>
          <pre class="snapshot-json">{{
            formatJson(selectedSnapshot.snapshotJson)
          }}</pre>
        </label>
        <div class="modal__actions">
          <NebulaButton variant="outline" @click="selectedSnapshot = null">
            关闭
          </NebulaButton>
        </div>
      </NebulaPane>
    </div>
  </div>
</template>

<style scoped>
.version-page__search {
  min-width: 240px;
}

.field-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.version-detail {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 13px;
}

.version-detail dt {
  color: hsl(var(--muted-foreground));
}

.version-detail dd {
  margin: 0;
}

.snapshot-json {
  max-height: 300px;
  padding: 12px;
  margin: 0;
  overflow: auto;
  font-size: 12px;
  line-height: 1.5;
  color: hsl(var(--foreground));
  background: hsl(var(--muted));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
}
</style>
