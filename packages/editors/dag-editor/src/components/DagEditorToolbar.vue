<script setup lang="ts">
import { NebulaButton } from '@nebula-studio/nebula-ui';

defineProps<{
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedNodeLabel: string;
  selectedEdgeLabel: string;
  nodeCount: number;
}>();

const emit = defineEmits<{
  addNode: [];
  deleteNode: [];
  deleteEdge: [];
  autoLayout: [];
}>();
</script>

<template>
  <div class="dag-editor__toolbar">
    <NebulaButton variant="secondary" @click="emit('addNode')"
      >新增节点</NebulaButton
    >
    <NebulaButton
      variant="secondary"
      :disabled="!selectedNodeId"
      @click="emit('deleteNode')"
    >
      删除节点
    </NebulaButton>
    <NebulaButton
      variant="secondary"
      :disabled="!selectedEdgeId"
      @click="emit('deleteEdge')"
    >
      删除连线
    </NebulaButton>
    <NebulaButton
      variant="secondary"
      :disabled="nodeCount === 0"
      @click="emit('autoLayout')"
    >
      自动布局
    </NebulaButton>
    <span v-if="selectedNodeId" class="dag-editor__selection-hint">
      已选中节点：{{ selectedNodeLabel }}
    </span>
    <span v-else-if="selectedEdgeId" class="dag-editor__selection-hint">
      已选中连线：{{ selectedEdgeLabel }}（Delete 可删除）
    </span>
    <span
      v-else
      class="dag-editor__selection-hint dag-editor__selection-hint--muted"
    >
      从节点拖出到目标节点即可连线；点击连线可选中删除
    </span>
  </div>
</template>

<style scoped>
.dag-editor__toolbar {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.dag-editor__selection-hint {
  margin-left: auto;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.dag-editor__selection-hint--muted {
  opacity: 0.85;
}
</style>
