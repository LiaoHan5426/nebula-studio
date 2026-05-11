<script setup lang="ts">
export interface DocsApiRow {
  name: string;
  description: string;
  type?: string;
}

defineProps<{
  title?: string;
  rows: DocsApiRow[];
  /** 根节点 `id`，供页内锚点 */
  sectionId?: string;
}>();
</script>

<template>
  <section class="api-table-wrap" :id="sectionId || undefined">
    <h3>{{ title ?? 'API' }}</h3>
    <div class="api-table">
      <div class="api-table__head">Name</div>
      <div class="api-table__head">Description</div>
      <template v-for="row in rows" :key="row.name">
        <div class="api-table__name">
          <code>{{ row.name }}</code>
          <span v-if="row.type">{{ row.type }}</span>
        </div>
        <div class="api-table__desc">{{ row.description }}</div>
      </template>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.api-table-wrap {
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  background: hsl(var(--card));
  padding: 1rem;
}

.api-table-wrap h3 {
  margin: 0;
  font-size: 1rem;
  line-height: 1.3;
}

.api-table {
  display: grid;
  grid-template-columns: minmax(220px, 320px) minmax(0, 1fr);
  margin-top: 0.85rem;
  border-top: 1px solid hsl(var(--border));
  border-left: 1px solid hsl(var(--border));
  border-radius: 10px;
  overflow: hidden;
}

.api-table__head,
.api-table__name,
.api-table__desc {
  border-right: 1px solid hsl(var(--border));
  border-bottom: 1px solid hsl(var(--border));
  padding: 0.7rem 0.8rem;
}

.api-table__head {
  background: hsl(var(--accent) / 25%);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.2;
}

.api-table__name {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: hsl(var(--background) / 30%);
}

.api-table__name code {
  font-size: 0.9rem;
  line-height: 1.35;
  word-break: break-word;
}

.api-table__name span {
  font-size: 0.78rem;
  color: hsl(var(--muted-foreground));
}

.api-table__desc {
  color: hsl(var(--muted-foreground));
  font-size: 0.88rem;
  line-height: 1.5;
  word-break: break-word;
}

.api-table__name:nth-child(4n + 3),
.api-table__desc:nth-child(4n + 4) {
  background: hsl(var(--accent) / 10%);
}

@media (width <= 740px) {
  .api-table {
    grid-template-columns: 1fr;
  }

  .api-table__head:nth-child(2) {
    display: none;
  }

  .api-table__name {
    border-bottom: 0;
  }

  .api-table__desc {
    padding-top: 0.2rem;
    margin-bottom: 0.3rem;
  }
}
</style>
