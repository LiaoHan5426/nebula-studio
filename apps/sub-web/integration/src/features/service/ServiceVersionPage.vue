<template>
  <div class="service-version-page">
    <div class="page-header">
      <h2>版本管理</h2>
      <div class="header-actions">
        <NebulaInput
          v-model="resourceId"
          placeholder="输入资源 ID 查询"
          class="input-resource"
          @keydown.enter="loadSnapshots"
        />
        <NebulaButton variant="secondary" @click="loadSnapshots"
          >查询</NebulaButton
        >
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <template v-else>
      <table class="version-table">
        <thead>
          <tr>
            <th>版本 ID</th>
            <th>资源 ID</th>
            <th>标签</th>
            <th>创建者</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="snap in snapshots" :key="snap.versionId">
            <td>{{ snap.versionId }}</td>
            <td>{{ snap.resourceId }}</td>
            <td>{{ snap.label || '-' }}</td>
            <td>{{ snap.createdBy || '-' }}</td>
            <td>{{ formatTime(snap.createdAt) }}</td>
            <td>
              <NebulaButton
                variant="secondary"
                size="sm"
                @click="viewDetail(snap)"
                >详情</NebulaButton
              >
              <NebulaButton
                variant="secondary"
                size="sm"
                @click="requestRollback(snap)"
              >
                回滚
              </NebulaButton>
            </td>
          </tr>
          <tr v-if="snapshots.length === 0">
            <td colspan="6" class="empty">暂无版本快照</td>
          </tr>
        </tbody>
      </table>

      <!-- 回滚确认弹窗 -->
      <div
        v-if="rollbackTarget"
        class="modal-overlay"
        @click.self="rollbackTarget = null"
      >
        <div class="modal-card modal-confirm">
          <h3>确认回滚</h3>
          <p>确认回滚到版本 {{ rollbackTarget.versionId }}？</p>
          <div class="modal-actions">
            <NebulaButton variant="secondary" @click="rollbackTarget = null">
              取消
            </NebulaButton>
            <NebulaButton
              variant="primary"
              class="btn-danger"
              @click="confirmRollback"
            >
              确认
            </NebulaButton>
          </div>
        </div>
      </div>

      <!-- 详情弹窗 -->
      <div
        v-if="selectedSnapshot"
        class="modal-overlay"
        @click.self="selectedSnapshot = null"
      >
        <div class="modal-card">
          <h3>快照详情</h3>
          <div class="detail-field">
            <span class="detail-label">版本 ID:</span>
            <span>{{ selectedSnapshot.versionId }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">资源 ID:</span>
            <span>{{ selectedSnapshot.resourceId }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">标签:</span>
            <span>{{ selectedSnapshot.label || '-' }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">创建者:</span>
            <span>{{ selectedSnapshot.createdBy || '-' }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">创建时间:</span>
            <span>{{ formatTime(selectedSnapshot.createdAt) }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">快照内容:</span>
            <pre class="snapshot-json">{{
              formatJson(selectedSnapshot.snapshotJson)
            }}</pre>
          </div>
          <div class="modal-actions">
            <NebulaButton variant="secondary" @click="selectedSnapshot = null">
              关闭
            </NebulaButton>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NebulaButton, NebulaInput } from '@nebula-studio/nebula-ui';
import { versionApi } from '@/shared/api/consoleApi';
import type { VersionSnapshot } from '@/shared/types';

const snapshots = ref<VersionSnapshot[]>([]);
const loading = ref(false);
const resourceId = ref('');
const selectedSnapshot = ref<VersionSnapshot | null>(null);

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

const rollbackTarget = ref<VersionSnapshot | null>(null);

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

<style scoped>
.service-version-page {
  padding: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.input-resource {
  min-width: 220px;
}

.version-table {
  width: 100%;
  border-collapse: collapse;
}

.version-table th,
.version-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid hsl(var(--border));
}

.version-table th {
  font-weight: 600;
  background: hsl(var(--muted));
}

.loading,
.empty {
  padding: 24px;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 45%);
}

.modal-card {
  width: min(560px, calc(100vw - 32px));
  padding: 20px 24px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.modal-card h3 {
  margin: 0 0 16px;
  font-size: 16px;
}

.detail-field {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.6;
}

.detail-label {
  width: 80px;
  color: hsl(var(--muted-foreground));
  text-align: right;
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

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}

.modal-confirm p {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.6;
}

.btn-danger {
  color: hsl(var(--destructive-foreground));
  background: hsl(var(--destructive));
}
</style>
