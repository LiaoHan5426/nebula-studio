<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <RouterView />
</template>

<style>
* {
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
  min-height: 0;
  margin: 0;
}

#app {
  display: flex;
  flex-direction: column;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
}

body::selection {
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
}
</style>

<style lang="scss">
.page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.page > :is(.nebula-page-header, header:first-child),
.entity-list-page > :first-child {
  padding-bottom: var(--space-4);
  border-bottom: 1px solid hsl(var(--border));
}

.page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.page__table-wrap {
  overflow: hidden;
  border: 1px solid hsl(var(--border) / 72%);
  background: hsl(var(--background));
  border-radius: var(--radius-md);
}

.page :is(input, select, textarea):focus-visible {
  outline: 3px solid hsl(var(--primary) / 22%);
  outline-offset: 1px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  font-size: 13px;
}

.field__readonly {
  opacity: 0.85;
}

.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}

.tree-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tree-node {
  padding: 8px 10px;
  font-size: 13px;
  background: hsl(var(--muted) / 24%);
  border: 1px solid hsl(var(--border) / 65%);
  border-radius: 8px;
}

.tree-node__meta {
  margin-top: 2px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.tree-children {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 16px;
  margin-top: 4px;
}
</style>
