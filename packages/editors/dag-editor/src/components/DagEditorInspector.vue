<script setup lang="ts">
import type { PluginNodeSchema } from '@nebula-studio/nebula-low-render';

import { computed } from 'vue';

import { tryUseEditorHost } from '@nebula-studio/nebula-assembly';
import { NebulaCodeEditor } from '@nebula-studio/nebula-code-editor';
import { PluginNodeForm } from '@nebula-studio/nebula-low-render';
import { NebulaButton } from '@nebula-studio/nebula-ui';

const props = defineProps<{
  readonly?: boolean;
  selectedNodeLabel: string;
  selectedSchema: PluginNodeSchema;
}>();

const emit = defineEmits<{
  deleteNode: [];
}>();

const selectedConfig = defineModel<Record<string, unknown>>('selectedConfig', {
  required: true,
});

const editorHost = tryUseEditorHost();

const scriptFieldKey = computed(() => {
  const field = props.selectedSchema.fields?.find(
    (item) => item.key === 'script' || item.key === 'expression',
  );
  return field?.key;
});

const scriptValue = computed({
  get: () => String(selectedConfig.value[scriptFieldKey.value ?? ''] ?? ''),
  set: (value: string) => {
    if (!scriptFieldKey.value) return;
    selectedConfig.value = {
      ...selectedConfig.value,
      [scriptFieldKey.value]: value,
    };
  },
});

const codeHeight = computed(() => editorHost?.size.value.height ?? '200px');
</script>

<template>
  <aside class="dag-editor__panel">
    <div class="dag-editor__panel-head">
      <div>
        <p class="dag-editor__panel-kicker">节点配置</p>
        <h4 class="dag-editor__panel-title">{{ selectedNodeLabel }}</h4>
      </div>
      <NebulaButton
        variant="secondary"
        :disabled="readonly"
        @click="emit('deleteNode')"
      >
        删除
      </NebulaButton>
    </div>
    <PluginNodeForm
      v-model="selectedConfig"
      :schema="selectedSchema"
      :show-title="false"
    />
    <section v-if="scriptFieldKey" class="dag-editor__code-section">
      <p class="dag-editor__panel-kicker">脚本</p>
      <NebulaCodeEditor
        v-model="scriptValue"
        language="javascript"
        :readonly="readonly ?? editorHost?.readonly.value ?? false"
        :height="codeHeight"
        @error="
          editorHost?.diagnostics.push({
            level: 'error',
            message: $event.message,
          })
        "
      />
    </section>
  </aside>
</template>

<style scoped>
.dag-editor__panel {
  padding: 10px;
  overflow: visible;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.dag-editor__panel-head {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
}

.dag-editor__panel-kicker {
  margin: 0 0 4px;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.dag-editor__panel-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}

.dag-editor__code-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}
</style>
