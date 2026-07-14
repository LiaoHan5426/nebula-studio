<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { releaseApi } from '@/shared/api/consoleApi';
import type { ReleaseRecord } from '@/shared/types';

const releases = ref<ReleaseRecord[]>([]);
const loading = ref(false);

const STATUS_LABELS: Record<string, string> = {
  DRAFT: '草稿',
  VERSIONED: '已版本化',
  APPROVED: '已审批',
  DEPLOYING: '部署中',
  DEPLOYED: '已部署',
  ROLLED_BACK: '已回滚',
};

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

function statusVariant(status: string) {
  if (status === 'DEPLOYED') return 'success';
  if (status === 'APPROVED') return 'info';
  if (status === 'ROLLED_BACK') return 'warning';
  if (status === 'DEPLOYING') return 'warning';
  return 'default';
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

<template>
  <div class="page">
    <NebulaPane title="发布管理" description="查看服务发布记录并执行部署或回滚">
      <div class="page__toolbar">
        <NebulaButton variant="outline" @click="loadReleases"
          >刷新</NebulaButton
        >
      </div>

      <div class="page__table-wrap">
        <NebulaTable
          :data="releases"
          :loading="loading"
          row-key="releaseId"
          :scroll-x="{ enabled: true }"
        >
          <NebulaTableColumn
            field="releaseId"
            title="发布 ID"
            min-width="120"
            show-overflow="tooltip"
          />
          <NebulaTableColumn
            field="resourceId"
            title="资源 ID"
            min-width="120"
            show-overflow="tooltip"
          />
          <NebulaTableColumn field="versionId" title="版本 ID" min-width="100">
            <template #default="{ row }">
              {{ row.versionId || '-' }}
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn field="status" title="状态" width="108">
            <template #default="{ row }">
              <NebulaTag :variant="statusVariant(row.status)">
                {{ statusLabel(row.status) }}
              </NebulaTag>
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn field="createdBy" title="创建者" width="96">
            <template #default="{ row }">
              {{ row.createdBy || '-' }}
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn field="createdAt" title="创建时间" width="160">
            <template #default="{ row }">
              {{ formatTime(row.createdAt) }}
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn field="deployedAt" title="部署时间" width="160">
            <template #default="{ row }">
              {{ row.deployedAt ? formatTime(row.deployedAt) : '-' }}
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn title="操作" width="160">
            <template #default="{ row }">
              <div v-if="canOperate(row)" class="row-actions">
                <NebulaButton
                  v-if="row.status === 'APPROVED'"
                  variant="outline"
                  @click="handleDeploy(row)"
                >
                  部署
                </NebulaButton>
                <NebulaButton
                  v-if="row.status === 'DEPLOYED'"
                  variant="outline"
                  @click="handleRollback(row)"
                >
                  回滚
                </NebulaButton>
              </div>
              <span v-else class="page__meta">-</span>
            </template>
          </NebulaTableColumn>
        </NebulaTable>
      </div>
    </NebulaPane>
  </div>
</template>
