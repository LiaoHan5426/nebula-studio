<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NebulaButton, NebulaPane, NebulaTag } from '@nebula-studio/nebula-ui';

import { taskApi } from '@/shared/api/taskApi';
import { useTenant } from '@/shared/composables/useTenant';
import type {
  TaskInstance,
  TaskLog,
} from '@nebula-studio/contracts/integration';
import { isApiSuccess } from '@nebula-studio/contracts/integration';

const { currentTenantId } = useTenant();

const instances = ref<TaskInstance[]>([]);
const selectedInstance = ref<TaskInstance | null>(null);
const logs = ref<TaskLog[]>([]);
const loading = ref(false);
const logsLoading = ref(false);

onMounted(async () => {
  await loadInstances();
});

async function loadInstances() {
  loading.value = true;
  try {
    const response = await taskApi.listInstances(
      undefined,
      currentTenantId.value,
    );
    if (isApiSuccess(response)) {
      instances.value = response.data;
    }
  } finally {
    loading.value = false;
  }
}

async function viewLogs(instance: TaskInstance) {
  selectedInstance.value = instance;
  logsLoading.value = true;
  try {
    const response = await taskApi.getInstanceLogs(instance.instanceId);
    if (isApiSuccess(response)) {
      logs.value = response.data;
    }
  } finally {
    logsLoading.value = false;
  }
}

async function retryInstance(instanceId: string) {
  await taskApi.retryInstance(instanceId);
  await loadInstances();
  if (selectedInstance.value?.instanceId === instanceId) {
    const current = instances.value.find((i) => i.instanceId === instanceId);
    if (current) await viewLogs(current);
  }
}

function statusVariant(status: string) {
  if (status === 'COMPLETED') return 'success';
  if (status === 'RUNNING' || status === 'SCHEDULED') return 'warning';
  if (status === 'FAILED' || status === 'TIMEOUT') return 'danger';
  return 'default';
}
</script>

<template>
  <div class="page">
    <NebulaPane title="任务实例" description="查看执行状态、日志与重试失败任务">
      <div class="page__toolbar">
        <NebulaButton variant="secondary" @click="loadInstances"
          >刷新</NebulaButton
        >
      </div>

      <div v-if="loading" class="page__empty">加载中…</div>
      <div v-else-if="instances.length === 0" class="page__empty">
        暂无执行实例
      </div>
      <div v-else class="page__layout">
        <div class="page__list">
          <article
            v-for="instance in instances"
            :key="instance.instanceId"
            class="page__card"
            :class="{
              'page__card--active':
                selectedInstance?.instanceId === instance.instanceId,
            }"
            @click="viewLogs(instance)"
          >
            <div class="page__card-head">
              <div>
                <h3>{{ instance.taskName || instance.definitionId }}</h3>
                <p class="page__meta">
                  {{ instance.instanceId }} · 重试
                  {{ instance.retryCount ?? 0 }}
                </p>
              </div>
              <NebulaTag :variant="statusVariant(instance.status)">{{
                instance.status
              }}</NebulaTag>
            </div>
            <div class="page__actions">
              <NebulaButton
                v-if="
                  instance.status === 'FAILED' || instance.status === 'TIMEOUT'
                "
                variant="secondary"
                @click.stop="retryInstance(instance.instanceId)"
              >
                重试
              </NebulaButton>
            </div>
          </article>
        </div>

        <NebulaPane v-if="selectedInstance" title="执行日志" class="page__logs">
          <p class="page__meta">实例 {{ selectedInstance.instanceId }}</p>
          <div v-if="logsLoading" class="page__empty">加载日志…</div>
          <div v-else-if="logs.length === 0" class="page__empty">暂无日志</div>
          <ul v-else class="page__log-list">
            <li v-for="log in logs" :key="log.logId" class="page__log-item">
              <span class="page__log-level">{{ log.level }}</span>
              <span>{{ log.message }}</span>
              <time v-if="log.timestamp">{{ log.timestamp }}</time>
            </li>
          </ul>
        </NebulaPane>
      </div>
    </NebulaPane>
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
  padding: 24px;
  margin: 0 auto;
}

.page__toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.page__empty {
  padding: 24px;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.page__layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.page__list {
  display: grid;
  gap: 12px;
}

.page__card {
  padding: 16px;
  cursor: pointer;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.page__card--active {
  border-color: hsl(var(--primary));
}

.page__card-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.page__card-head h3 {
  font-size: 15px;
  font-weight: 600;
}

.page__meta {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.page__actions {
  display: flex;
  gap: 8px;
}

.page__logs {
  min-height: 320px;
}

.page__log-list {
  display: grid;
  gap: 8px;
  padding: 0;
  margin: 12px 0 0;
  list-style: none;
}

.page__log-item {
  display: grid;
  gap: 4px;
  padding: 8px;
  font-size: 12px;
  background: hsl(var(--muted) / 30%);
  border-radius: 6px;
}

.page__log-level {
  font-weight: 600;
}

@media (max-width: 900px) {
  .page__layout {
    grid-template-columns: 1fr;
  }
}
</style>
