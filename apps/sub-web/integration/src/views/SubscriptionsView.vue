<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { subscriptionApi } from '../services/api';
import type {
  TableSubscription,
  SubscriptionConfig,
  SubscribeType,
} from '../types';

const subscriptions = ref<TableSubscription[]>([]);
const loading = ref(false);
const showCreateDialog = ref(false);

const newSubscription = ref<Partial<SubscriptionConfig>>({
  subscribeType: 'POLLING' as SubscribeType,
  columns: [],
  eventTypes: ['INSERT', 'UPDATE', 'DELETE'],
});

onMounted(async () => {
  await loadSubscriptions();
});

async function loadSubscriptions() {
  loading.value = true;
  try {
    const response = await subscriptionApi.list();
    if (response.success) {
      subscriptions.value = response.data.items;
    }
  } catch (error) {
    console.error('Failed to load subscriptions:', error);
  } finally {
    loading.value = false;
  }
}

async function handleCreate() {
  try {
    const response = await subscriptionApi.create(
      newSubscription.value as SubscriptionConfig,
    );
    if (response.success) {
      showCreateDialog.value = false;
      await loadSubscriptions();
    }
  } catch (error) {
    console.error('Failed to create subscription:', error);
  }
}

async function handlePause(subscriptionId: string) {
  try {
    await subscriptionApi.pause(subscriptionId);
    await loadSubscriptions();
  } catch (error) {
    console.error('Failed to pause subscription:', error);
  }
}

async function handleResume(subscriptionId: string) {
  try {
    await subscriptionApi.resume(subscriptionId);
    await loadSubscriptions();
  } catch (error) {
    console.error('Failed to resume subscription:', error);
  }
}

async function handleDelete(subscriptionId: string) {
  try {
    await subscriptionApi.delete(subscriptionId);
    await loadSubscriptions();
  } catch (error) {
    console.error('Failed to delete subscription:', error);
  }
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    ACTIVE: 'hsl(var(--success))',
    INACTIVE: 'hsl(var(--muted-foreground))',
    SUSPENDED: 'hsl(var(--warning))',
    ERROR: 'hsl(var(--destructive))',
  };
  return colors[status] || status;
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    ACTIVE: '运行中',
    INACTIVE: '未激活',
    SUSPENDED: '已暂停',
    ERROR: '错误',
  };
  return texts[status] || status;
}
</script>

<template>
  <div class="subscriptions-view">
    <div class="page-header">
      <h2 class="page-title">库表订阅</h2>
      <button class="btn btn-primary" @click="showCreateDialog = true">
        新建订阅
      </button>
    </div>

    <div v-if="loading" class="loading-state">加载中...</div>

    <div v-else-if="subscriptions.length === 0" class="empty-state">
      <div class="empty-icon">📊</div>
      <div class="empty-text">暂无订阅，点击上方按钮创建</div>
    </div>

    <div v-else class="subscriptions-list">
      <div
        v-for="subscription in subscriptions"
        :key="subscription.subscriptionId"
        class="subscription-card"
      >
        <div class="subscription-header">
          <div class="subscription-info">
            <h3 class="subscription-title">{{ subscription.tableName }}</h3>
            <p class="subscription-source">{{ subscription.dataSourceId }}</p>
          </div>
          <div class="subscription-status">
            <span
              class="status-badge"
              :style="{ color: getStatusColor(subscription.status) }"
            >
              {{ getStatusText(subscription.status) }}
            </span>
          </div>
        </div>

        <div class="subscription-details">
          <div class="detail-item">
            <span class="detail-label">订阅类型:</span>
            <span class="detail-value">{{ subscription.subscribeType }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">创建时间:</span>
            <span class="detail-value">{{
              new Date(subscription.createdAt).toLocaleString()
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">订阅列:</span>
            <span class="detail-value">{{
              subscription.config.columns.join(', ') || '全部'
            }}</span>
          </div>
        </div>

        <div class="subscription-actions">
          <button
            v-if="subscription.status === 'ACTIVE'"
            class="btn btn-secondary"
            @click="handlePause(subscription.subscriptionId)"
          >
            暂停
          </button>
          <button
            v-if="subscription.status === 'SUSPENDED'"
            class="btn btn-secondary"
            @click="handleResume(subscription.subscriptionId)"
          >
            恢复
          </button>
          <button
            class="btn btn-danger"
            @click="handleDelete(subscription.subscriptionId)"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 创建订阅对话框 -->
    <div
      v-if="showCreateDialog"
      class="modal-overlay"
      @click.self="showCreateDialog = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h3>新建订阅</h3>
          <button class="modal-close" @click="showCreateDialog = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">数据源</label>
            <select v-model="newSubscription.dataSourceId" class="form-input">
              <option value="">请选择数据源</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">表名</label>
            <input
              v-model="newSubscription.tableName"
              class="form-input"
              placeholder="输入表名"
            />
          </div>
          <div class="form-group">
            <label class="form-label">订阅类型</label>
            <select v-model="newSubscription.subscribeType" class="form-input">
              <option value="POLLING">轮询</option>
              <option value="CDC">CDC</option>
              <option value="TRIGGER">触发器</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreateDialog = false">
            取消
          </button>
          <button class="btn btn-primary" @click="handleCreate">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.subscriptions-view {
  max-width: 1200px;
  padding: 24px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.btn {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-primary {
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
}

.btn-primary:hover {
  background: hsl(var(--primary) / 80%);
}

.btn-secondary {
  color: hsl(var(--foreground));
  background: hsl(var(--secondary));
  border: 1px solid hsl(var(--border));
}

.btn-secondary:hover {
  background: hsl(var(--muted));
}

.btn-danger {
  color: hsl(var(--destructive-foreground));
  background: hsl(var(--destructive));
}

.btn-danger:hover {
  background: hsl(var(--destructive) / 80%);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: hsl(var(--muted-foreground));
}

.empty-icon {
  margin-bottom: 16px;
  font-size: 48px;
}

.subscriptions-list {
  display: grid;
  gap: 16px;
}

.subscription-card {
  padding: 16px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.subscription-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.subscription-info {
  flex: 1;
}

.subscription-title {
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.subscription-source {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.status-badge {
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  background: hsl(var(--muted) / 40%);
  border-radius: 4px;
}

.subscription-details {
  display: grid;
  gap: 8px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.detail-item {
  display: flex;
  font-size: 13px;
}

.detail-label {
  flex-shrink: 0;
  width: 80px;
  color: hsl(var(--muted-foreground));
}

.detail-value {
  flex: 1;
  color: hsl(var(--foreground));
}

.subscription-actions {
  display: flex;
  gap: 8px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
}

.modal {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
  background: hsl(var(--card));
  border-radius: 8px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid hsl(var(--border));
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  font-size: 24px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: none;
  border: none;
}

.modal-close:hover {
  color: hsl(var(--foreground));
}

.modal-body {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--foreground));
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.form-input:focus {
  outline: none;
  border-color: hsl(var(--primary));
}

.modal-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid hsl(var(--border));
}
</style>
