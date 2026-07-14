<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NebulaButton, NebulaPane, NebulaTag } from '@nebula-studio/nebula-ui';

import { taskApi } from '@/shared/api/taskApi';
import { useTenant } from '@/shared/composables/useTenant';
import type {
  TaskInstance,
  TaskLog,
} from '@nebula-studio/contracts/integration';
import { isApiSuccess } from '@nebula-studio/api-client';

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
        <NebulaButton variant="outline" @click="loadInstances"
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
            class="page__card page__card--clickable"
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
                variant="outline"
                @click.stop="retryInstance(instance.instanceId)"
              >
                重试
              </NebulaButton>
            </div>
          </article>
        </div>

        <NebulaPane
          v-if="selectedInstance"
          title="执行日志"
          class="page__detail"
        >
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
