<script setup lang="ts">
import { NebulaButton } from '@nebula-studio/nebula-ui';

defineProps<{
  nodeCount: number;
  readonly?: boolean;
  selectedEdgeId: null | string;
  selectedEdgeLabel: string;
  selectedNodeId: null | string;
  selectedNodeLabel: string;
}>();

const emit = defineEmits<{
  addNode: [];
  autoLayout: [];
  deleteEdge: [];
  deleteNode: [];
}>();
</script>

<template>
  <div class="dag-editor__toolbar">
    <NebulaButton
      variant="secondary"
      :disabled="readonly"
      @click="emit('addNode')"
    >
      新增节点
    </NebulaButton>
    <NebulaButton
      variant="secondary"
      :disabled="readonly || !selectedNodeId"
      @click="emit('deleteNode')"
    >
      删除节点
    </NebulaButton>
    <NebulaButton
      variant="secondary"
      :disabled="readonly || !selectedEdgeId"
      @click="emit('deleteEdge')"
    >
      删除连线
    </NebulaButton>
    <NebulaButton
      variant="secondary"
      :disabled="readonly || nodeCount === 0"
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
