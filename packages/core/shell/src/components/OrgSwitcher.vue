<!--
  组织切换组件。

  从 `frontend/App.vue` 提取（Plan-11 Task 10）。
  当多组织功能启用时，在 Shell 顶栏展示组织选择器。
-->
<script setup lang="ts">
export interface OrgOption {
  id: string;
  orgName: string;
}

defineProps<{
  /** 是否启用组织功能 */
  enabled: boolean;
  /** 组织选项列表 */
  options: OrgOption[];
  /** 当前选中的组织 ID */
  currentOrgId: string;
  /** 是否正在加载 */
  loading: boolean;
  /** 是否可切换组织 */
  canSwitch: boolean;
}>();

const emit = defineEmits<{
  /** 用户选择了新组织 */
  switch: [orgId: string];
}>();

function onChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  emit('switch', target.value);
}
</script>

<template>
  <div v-if="enabled && options.length > 0" class="org-switcher">
    <label class="org-switcher__label" for="shell-org-select">组织</label>
    <select
      id="shell-org-select"
      class="org-switcher__select"
      :value="currentOrgId"
      :disabled="loading || !canSwitch"
      @change="onChange"
    >
      <option v-for="org in options" :key="org.id" :value="org.id">
        {{ org.orgName }}
      </option>
    </select>
  </div>
</template>

<style lang="scss" scoped>
.org-switcher {
  display: flex;
  gap: 6px;
  align-items: center;
}

.org-switcher__label {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.org-switcher__select {
  min-width: 140px;
  max-width: 220px;
  padding: 4px 8px;
  font: inherit;
  font-size: 12px;
  color: hsl(var(--foreground));
  background: hsl(var(--background) / 80%);
  border: 1px solid hsl(var(--border) / 72%);
  border-radius: 6px;
}
</style>
