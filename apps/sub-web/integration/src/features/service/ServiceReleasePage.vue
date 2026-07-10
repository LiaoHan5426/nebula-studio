<template>
  <div class="service-release-page">
    <div class="page-header">
      <h2>发布管理</h2>
      <button class="btn-refresh" @click="loadReleases">刷新</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <table v-else class="release-table">
      <thead>
        <tr>
          <th>发布 ID</th>
          <th>资源 ID</th>
          <th>版本 ID</th>
          <th>状态</th>
          <th>创建者</th>
          <th>创建时间</th>
          <th>部署时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="release in releases" :key="release.releaseId">
          <td>{{ release.releaseId }}</td>
          <td>{{ release.resourceId }}</td>
          <td>{{ release.versionId || '-' }}</td>
          <td>
            <span
              :class="[
                'status-badge',
                `status-${release.status.toLowerCase().replace('_', '-')}`,
              ]"
            >
              {{ statusLabel(release.status) }}
            </span>
          </td>
          <td>{{ release.createdBy || '-' }}</td>
          <td>{{ formatTime(release.createdAt) }}</td>
          <td>
            {{ release.deployedAt ? formatTime(release.deployedAt) : '-' }}
          </td>
          <td>
            <button
              v-if="release.status === 'APPROVED'"
              class="btn-action"
              @click="handleDeploy(release)"
            >
              部署
            </button>
            <button
              v-if="release.status === 'DEPLOYED'"
              class="btn-action btn-danger"
              @click="handleRollback(release)"
            >
              回滚
            </button>
            <span v-if="!canOperate(release)" class="text-muted">-</span>
          </td>
        </tr>
        <tr v-if="releases.length === 0">
          <td colspan="8" class="empty">暂无发布记录</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { releaseApi } from '@/shared/api/consoleApi';
import type { ReleaseRecord } from '@/shared/types';

const releases = ref<ReleaseRecord[]>([]);
const loading = ref(false);

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: '草稿',
    VERSIONED: '已版本化',
    APPROVED: '已审批',
    DEPLOYING: '部署中',
    DEPLOYED: '已部署',
    ROLLED_BACK: '已回滚',
  };
  return map[status] || status;
}

function formatTime(iso: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('zh-CN');
}

function canOperate(release: ReleaseRecord): boolean {
  return release.status === 'APPROVED' || release.status === 'DEPLOYED';
}

async function loadReleases() {
  loading.value = true;
  try {
    const tenantId = localStorage.getItem('tenant_id') || undefined;
    const res = await releaseApi.listReleases(tenantId);
    releases.value = res.data ?? [];
  } catch {
    releases.value = [];
  } finally {
    loading.value = false;
  }
}

async function handleDeploy(release: ReleaseRecord) {
  try {
    await releaseApi.deployRelease(release.releaseId, 'admin');
    await loadReleases();
  } catch (e) {
    console.error('Deploy failed:', e);
  }
}

async function handleRollback(release: ReleaseRecord) {
  try {
    await releaseApi.rollback(release.releaseId, 'admin');
    await loadReleases();
  } catch (e) {
    console.error('Rollback failed:', e);
  }
}

onMounted(loadReleases);
</script>

<style scoped>
.service-release-page {
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

.release-table {
  width: 100%;
  border-collapse: collapse;
}

.release-table th,
.release-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.release-table th {
  font-weight: 600;
  background: #fafafa;
}

.status-badge {
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.status-draft {
  background: #f0f0f0;
}

.status-versioned {
  background: #e6f7ff;
}

.status-approved {
  background: #f6ffed;
}

.status-deploying {
  background: #fff7e6;
}

.status-deployed {
  color: #155724;
  background: #d4edda;
}

.status-rolled-back {
  color: #721c24;
  background: #f8d7da;
}

.btn-action {
  padding: 4px 12px;
  margin-right: 4px;
  color: #1890ff;
  cursor: pointer;
  background: transparent;
  border: 1px solid #1890ff;
  border-radius: 4px;
}

.btn-danger {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.btn-refresh {
  padding: 4px 12px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.loading,
.empty {
  padding: 24px;
  color: #999;
  text-align: center;
}

.text-muted {
  color: #999;
}
</style>
