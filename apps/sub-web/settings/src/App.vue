<script setup lang="ts">
import { RouterView } from 'vue-router';
import ConfirmDialog from '@/shared/components/ConfirmDialog.vue';
</script>

<template>
  <RouterView />
  <ConfirmDialog />
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
</style>

<style lang="scss">
.page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.page__table-wrap {
  overflow: hidden;
  border: 1px solid hsl(var(--border) / 72%);
  border-radius: 12px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgb(8 10 18 / 52%);
  backdrop-filter: blur(2px);
}

.modal {
  width: min(480px, 100%);
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
