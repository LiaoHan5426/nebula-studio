<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NebulaButton, NebulaPane, NebulaTag } from '@nebula-studio/nebula-ui';

import { taskApi } from '@/shared/api/taskApi';
import { useTenant } from '@/shared/composables/useTenant';
import type {
  TaskCreateRequest,
  TaskDefinition,
  TaskUpdateRequest,
} from '@nebula-studio/contracts/integration';
import {
  TaskStatus,
  TaskType,
  isApiSuccess,
} from '@nebula-studio/contracts/integration';

const { currentTenantId } = useTenant();

const tasks = ref<TaskDefinition[]>([]);
const loading = ref(false);
const showCreate = ref(false);
const showEdit = ref(false);
const editingTask = ref<TaskDefinition | null>(null);

const CRON_PRESETS = [
  { label: '每分钟', value: '0 * * * *' },
  { label: '每 5 分钟', value: '0 */5 * * *' },
  { label: '每小时', value: '0 0 * * *' },
  { label: '每天 0 点', value: '0 0 0 * *' },
];

const form = ref<TaskCreateRequest>({
  name: '',
  taskType: TaskType.CRON,
  cronExpression: '0 * * * *',
  payload: '',
  triggerType: 'CRON',
});

const editForm = ref<TaskUpdateRequest>({});

onMounted(async () => {
  await loadTasks();
});

async function loadTasks() {
  loading.value = true;
  try {
    const response = await taskApi.list(currentTenantId.value);
    if (isApiSuccess(response)) {
      tasks.value = response.data;
    }
  } finally {
    loading.value = false;
  }
}

async function handleCreate() {
  const response = await taskApi.create(form.value);
  if (isApiSuccess(response)) {
    showCreate.value = false;
    resetForm();
    await loadTasks();
  }
}

function openEdit(task: TaskDefinition) {
  editingTask.value = task;
  editForm.value = {
    name: task.name,
    cronExpression: task.cronExpression,
    payload: task.payload,
  };
  showEdit.value = true;
}

async function handleEdit() {
  if (!editingTask.value) return;
  const response = await taskApi.update(editingTask.value.id, editForm.value);
  if (isApiSuccess(response)) {
    showEdit.value = false;
    editingTask.value = null;
    await loadTasks();
  }
}

async function handleDelete(id: string) {
  await taskApi.delete(id);
  await loadTasks();
}

async function handleTrigger(id: string) {
  await taskApi.trigger(id);
  await loadTasks();
}

async function handleChangeStatus(id: string, status: string) {
  await taskApi.changeStatus(id, status);
  await loadTasks();
}

function resetForm() {
  form.value = {
    name: '',
    taskType: TaskType.CRON,
    cronExpression: '0 * * * *',
    payload: '',
    triggerType: 'CRON',
  };
}

function statusVariant(status: string) {
  if (status === 'ACTIVE') return 'success';
  if (status === 'PAUSED') return 'warning';
  if (status === 'ERROR') return 'danger';
  return 'default';
}

function taskTypeLabel(type: string) {
  const map: Record<string, string> = {
    CRON: '定时任务',
    FIXED_DELAY: '固定延迟',
    FIXED_RATE: '固定频率',
    EVENT: '事件触发',
    MANUAL: '手动',
  };
  return map[type] ?? type;
}
</script>

<template>
  <div class="page">
    <NebulaPane title="任务调度" description="创建定时任务并管理执行状态">
      <div class="page__toolbar">
        <NebulaButton @click="showCreate = true">新建任务</NebulaButton>
        <NebulaButton variant="secondary" @click="loadTasks">刷新</NebulaButton>
      </div>

      <div v-if="loading" class="page__empty">加载中…</div>
      <div v-else-if="tasks.length === 0" class="page__empty">暂无任务</div>
      <div v-else class="page__list">
        <article v-for="task in tasks" :key="task.id" class="page__card">
          <div class="page__card-head">
            <div>
              <h3>{{ task.name }}</h3>
              <p class="page__meta">
                {{ taskTypeLabel(task.taskType) }}
                <template v-if="task.cronExpression">
                  · {{ task.cronExpression }}
                </template>
                · {{ task.triggerType }}
              </p>
            </div>
            <NebulaTag :variant="statusVariant(task.status)">{{
              task.status
            }}</NebulaTag>
          </div>
          <div v-if="task.payload" class="page__payload">
            <code>{{ task.payload }}</code>
          </div>
          <div class="page__actions">
            <NebulaButton
              v-if="task.status !== TaskStatus.ACTIVE"
              variant="secondary"
              @click="handleChangeStatus(task.id, TaskStatus.ACTIVE)"
            >
              启用
            </NebulaButton>
            <NebulaButton
              v-if="task.status === TaskStatus.ACTIVE"
              variant="secondary"
              @click="handleChangeStatus(task.id, TaskStatus.PAUSED)"
            >
              暂停
            </NebulaButton>
            <NebulaButton variant="secondary" @click="handleTrigger(task.id)">
              手动触发
            </NebulaButton>
            <NebulaButton variant="secondary" @click="openEdit(task)">
              编辑
            </NebulaButton>
            <NebulaButton variant="secondary" @click="handleDelete(task.id)">
              删除
            </NebulaButton>
          </div>
        </article>
      </div>
    </NebulaPane>

    <!-- 新建任务弹窗 -->
    <div
      v-if="showCreate"
      class="modal-overlay"
      @click.self="showCreate = false"
    >
      <NebulaPane title="新建任务" class="modal">
        <label class="field">
          <span>任务名称</span>
          <input v-model="form.name" placeholder="输入任务名称" />
        </label>
        <label class="field">
          <span>任务类型</span>
          <select v-model="form.taskType" class="field__select">
            <option :value="TaskType.CRON">定时任务 (CRON)</option>
            <option :value="TaskType.FIXED_DELAY">固定延迟</option>
            <option :value="TaskType.FIXED_RATE">固定频率</option>
            <option :value="TaskType.EVENT">事件触发</option>
            <option :value="TaskType.MANUAL">手动</option>
          </select>
        </label>
        <label v-if="form.taskType === TaskType.CRON" class="field">
          <span>Cron 表达式</span>
          <input v-model="form.cronExpression" placeholder="0 * * * *" />
          <div class="field__presets">
            <button
              v-for="preset in CRON_PRESETS"
              :key="preset.value"
              type="button"
              class="field__preset"
              @click="form.cronExpression = preset.value"
            >
              {{ preset.label }}
            </button>
          </div>
        </label>
        <label class="field">
          <span>负载内容 (Payload)</span>
          <textarea
            v-model="form.payload"
            placeholder="JSON 格式的任务数据"
            rows="3"
          />
        </label>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showCreate = false"
            >取消</NebulaButton
          >
          <NebulaButton @click="handleCreate">创建</NebulaButton>
        </div>
      </NebulaPane>
    </div>

    <!-- 编辑任务弹窗 -->
    <div v-if="showEdit" class="modal-overlay" @click.self="showEdit = false">
      <NebulaPane title="编辑任务" class="modal">
        <label class="field">
          <span>任务名称</span>
          <input v-model="editForm.name" />
        </label>
        <label class="field">
          <span>Cron 表达式</span>
          <input v-model="editForm.cronExpression" />
        </label>
        <label class="field">
          <span>负载内容 (Payload)</span>
          <textarea v-model="editForm.payload" rows="3" />
        </label>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showEdit = false"
            >取消</NebulaButton
          >
          <NebulaButton @click="handleEdit">保存</NebulaButton>
        </div>
      </NebulaPane>
    </div>
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

.page__list {
  display: grid;
  gap: 12px;
}

.page__card {
  padding: 16px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
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

.page__payload {
  padding: 8px;
  margin-bottom: 12px;
  overflow: auto;
  font-size: 12px;
  background: hsl(var(--muted) / 40%);
  border-radius: 6px;
}

.page__payload code {
  font-family: monospace;
}

.page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 45%);
}

.modal {
  width: min(480px, 92vw);
}

.field {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
}

.field input,
.field__select,
.field textarea {
  padding: 8px 10px;
  font-family: inherit;
  color: hsl(var(--foreground));
  resize: vertical;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.field__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.field__preset {
  padding: 4px 8px;
  font-size: 11px;
  color: hsl(var(--foreground));
  cursor: pointer;
  background: hsl(var(--muted) / 40%);
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
}

.field__preset:hover {
  background: hsl(var(--muted));
}

.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
