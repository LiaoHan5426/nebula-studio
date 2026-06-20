<script setup lang="ts">
import { NebulaButton } from '@nebula-studio/nebula-ui';

import type { OrganizationNode } from '@/shared/api/system';

defineProps<{
  node: OrganizationNode;
}>();

const emit = defineEmits<{
  addChild: [parentId: string];
  remove: [node: OrganizationNode];
}>();
</script>

<template>
  <div class="tree-list">
    <div class="tree-node">
      <div class="tree-node__title">{{ node.orgName }}</div>
      <div class="tree-node__meta">
        {{ node.orgCode }}
        <span v-if="node.status"> · {{ node.status }}</span>
      </div>
      <div class="tree-node__actions">
        <NebulaButton variant="ghost" @click="emit('addChild', node.id)">
          子组织
        </NebulaButton>
        <NebulaButton variant="ghost" @click="emit('remove', node)">
          删除
        </NebulaButton>
      </div>
    </div>
    <div v-if="node.children?.length" class="tree-children">
      <OrganizationTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        @add-child="emit('addChild', $event)"
        @remove="emit('remove', $event)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.tree-node__title {
  font-weight: 600;
}

.tree-node__actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}
</style>
