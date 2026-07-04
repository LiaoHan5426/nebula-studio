<script setup lang="ts">
export interface ApiProp {
  name: string;
  type: string;
  default?: string;
  description: string;
}

defineProps<{
  title?: string;
  columns?: ApiProp[];
}>();
</script>

<template>
  <div class="api-table">
    <h4 v-if="title" class="api-table__title">{{ title }}</h4>
    <table v-if="columns">
      <thead>
        <tr>
          <th>属性名</th>
          <th>类型</th>
          <th>默认值</th>
          <th>说明</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="col in columns" :key="col.name">
          <td>
            <code>{{ col.name }}</code>
          </td>
          <td>
            <code>{{ col.type }}</code>
          </td>
          <td>
            <code>{{ col.default ?? '—' }}</code>
          </td>
          <td>{{ col.description }}</td>
        </tr>
      </tbody>
    </table>
    <slot />
  </div>
</template>

<style scoped>
.api-table {
  margin: 16px 0;
}

.api-table__title {
  margin: 16px 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.api-table table {
  width: 100%;
  font-size: 14px;
  border-collapse: collapse;
}

.api-table th {
  padding: 10px 14px;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.api-table td {
  padding: 10px 14px;
  border: 1px solid var(--vp-c-divider);
}

.api-table tr:hover td {
  background: var(--vp-c-bg-soft);
}

.api-table code {
  padding: 2px 6px;
  font-size: 13px;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
}
</style>
