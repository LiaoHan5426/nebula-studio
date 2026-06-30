<template>
  <div class="service-approval-page">
    <div class="page-header">
      <h2>审批管理</h2>
      <button class="btn-refresh" @click="loadRequests">刷新</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <table v-else class="approval-table">
      <thead>
        <tr>
          <th>申请 ID</th>
          <th>资源 ID</th>
          <th>类型</th>
          <th>操作</th>
          <th>申请人</th>
          <th>状态</th>
          <th>原因</th>
          <th>提交时间</th>
          <th>审批操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="req in requests" :key="req.requestId">
          <td>{{ req.requestId }}</td>
          <td>{{ req.resourceId }}</td>
          <td>{{ req.resourceType }}</td>
          <td>{{ req.kind }}</td>
          <td>{{ req.applicantId }}</td>
          <td>
            <span
              :class="['status-badge', `status-${req.status.toLowerCase()}`]"
            >
              {{ statusLabel(req.status) }}
            </span>
          </td>
          <td>{{ req.reason || '-' }}</td>
          <td>{{ formatTime(req.createdAt) }}</td>
          <td>
            <template
              v-if="req.status === 'PENDING' || req.status === 'REVIEWING'"
            >
              <button class="btn-action" @click="handleApprove(req)">
                通过
              </button>
              <button class="btn-action btn-danger" @click="handleReject(req)">
                驳回
              </button>
            </template>
            <span v-else class="text-muted">-</span>
          </td>
        </tr>
        <tr v-if="requests.length === 0">
          <td colspan="9" class="empty">暂无审批请求</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { approvalApi } from '@/shared/api/consoleApi';
import type { GovernanceRequest } from '@/shared/types';

const requests = ref<GovernanceRequest[]>([]);
const loading = ref(false);

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: '待审批',
    REVIEWING: '审核中',
    APPROVED: '已通过',
    REJECTED: '已驳回',
  };
  return map[status] || status;
}

function formatTime(iso: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('zh-CN');
}

async function loadRequests() {
  loading.value = true;
  try {
    const tenantId = localStorage.getItem('tenant_id') || undefined;
    const res = await approvalApi.listRequests(tenantId);
    requests.value = res.data ?? [];
  } catch {
    requests.value = [];
  } finally {
    loading.value = false;
  }
}

async function handleApprove(req: GovernanceRequest) {
  try {
    await approvalApi.decide({
      requestId: req.requestId,
      decision: 'APPROVED',
      approverId: 'admin',
      comment: 'Approved via UI',
    });
    await loadRequests();
  } catch (e) {
    console.error('Approve failed:', e);
  }
}

async function handleReject(req: GovernanceRequest) {
  try {
    await approvalApi.decide({
      requestId: req.requestId,
      decision: 'REJECTED',
      approverId: 'admin',
      comment: 'Rejected via UI',
    });
    await loadRequests();
  } catch (e) {
    console.error('Reject failed:', e);
  }
}

onMounted(loadRequests);
</script>

<style scoped>
.service-approval-page {
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

.approval-table {
  width: 100%;
  border-collapse: collapse;
}

.approval-table th,
.approval-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.approval-table th {
  font-weight: 600;
  background: #fafafa;
}

.status-badge {
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.status-pending {
  background: #fff7e6;
}

.status-reviewing {
  background: #e6f7ff;
}

.status-approved {
  color: #155724;
  background: #d4edda;
}

.status-rejected {
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
