<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '../styles/bpmn-theme.css';

import {
  INTEGRATION_STARTER_BPMN,
  isBlankBpmn,
} from '../constants/integrationStarterBpmn';

const props = withDefaults(
  defineProps<{
    xml?: string;
    mode?: 'default' | 'integration';
  }>(),
  {
    mode: 'default',
  },
);

const emit = defineEmits<{
  (e: 'update:xml', xml: string): void;
  (e: 'changed'): void;
}>();

const canvasRef = ref<HTMLDivElement>();

let modeler: BpmnModeler | null = null;

function resolveInitialXml(): string {
  const xml = props.xml;
  if (!isBlankBpmn(xml)) {
    return (xml ?? '').trim();
  }
  return INTEGRATION_STARTER_BPMN;
}

async function importDiagram(xml: string) {
  if (!modeler) return;
  try {
    await modeler.importXML(xml);
    const canvas = modeler.get('canvas') as { zoom: (level: string) => void };
    canvas.zoom('fit-viewport');
  } catch (err) {
    console.error('Failed to import BPMN diagram:', err);
  }
}

onMounted(async () => {
  if (!canvasRef.value) return;

  modeler = new BpmnModeler({
    container: canvasRef.value,
  });

  await importDiagram(resolveInitialXml());

  modeler.on('commandStack.changed', () => {
    saveXml();
    emit('changed');
  });
});

onBeforeUnmount(() => {
  if (modeler) {
    modeler.destroy();
    modeler = null;
  }
});

const saveXml = async () => {
  if (!modeler) return;
  try {
    const { xml } = await modeler.saveXML({ format: true });
    if (xml) {
      emit('update:xml', xml);
    }
  } catch (err) {
    console.error('Failed to save XML:', err);
  }
};

const handleDownload = () => {
  if (!modeler) return;
  modeler.saveXML({ format: true }).then(({ xml }) => {
    if (!xml) return;
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'integration-flow.bpmn';
    a.click();
    URL.revokeObjectURL(url);
  });
};

const handleZoomIn = () => {
  if (!modeler) return;
  const canvas = modeler.get('canvas') as { zoom: (level: number) => number };
  canvas.zoom(canvas.zoom(1) * 1.2);
};

const handleZoomOut = () => {
  if (!modeler) return;
  const canvas = modeler.get('canvas') as { zoom: (level: number) => number };
  canvas.zoom(canvas.zoom(1) / 1.2);
};

const handleResetZoom = () => {
  if (!modeler) return;
  const canvas = modeler.get('canvas') as { zoom: (level: string) => void };
  canvas.zoom('fit-viewport');
};

watch(
  () => props.xml,
  async (newXml) => {
    if (!modeler) return;
    if (isBlankBpmn(newXml)) {
      await importDiagram(INTEGRATION_STARTER_BPMN);
      return;
    }
    const trimmed = (newXml ?? '').trim();
    if (trimmed) {
      await importDiagram(trimmed);
    }
  },
);

defineExpose({
  download: handleDownload,
  zoomIn: handleZoomIn,
  zoomOut: handleZoomOut,
  resetZoom: handleResetZoom,
});
</script>

<template>
  <div
    class="bpmn-editor-wrapper"
    :class="{ 'bpmn-editor-wrapper--integration': mode === 'integration' }"
  >
    <div class="toolbar">
      <span v-if="mode === 'integration'" class="toolbar-label"
        >集成流程设计</span
      >
      <button
        class="toolbar-btn"
        type="button"
        title="放大"
        @click="handleZoomIn"
      >
        <span>+</span>
      </button>
      <button
        class="toolbar-btn"
        type="button"
        title="缩小"
        @click="handleZoomOut"
      >
        <span>-</span>
      </button>
      <button
        class="toolbar-btn"
        type="button"
        title="适应画布"
        @click="handleResetZoom"
      >
        <span>⊞</span>
      </button>
      <div class="toolbar-divider"></div>
      <button
        class="toolbar-btn primary"
        type="button"
        title="下载 BPMN"
        @click="handleDownload"
      >
        <span>↓</span>
      </button>
    </div>

    <div class="editor-container">
      <div ref="canvasRef" class="bpmn-canvas"></div>
    </div>
  </div>
</template>

<style scoped>
.bpmn-editor-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.bpmn-editor-wrapper--integration .toolbar-label {
  margin-right: 8px;
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
}

.toolbar {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 8px 12px;
  background: hsl(var(--card));
  border-bottom: 1px solid hsl(var(--border));
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 16px;
  color: hsl(var(--foreground));
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: hsl(var(--muted));
  border-color: hsl(var(--muted-foreground));
}

.toolbar-btn.primary {
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.toolbar-btn.primary:hover {
  background: hsl(var(--primary) / 80%);
}

.toolbar-divider {
  width: 1px;
  height: 32px;
  margin: 0 4px;
  background: hsl(var(--border));
}

.editor-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.bpmn-canvas {
  flex: 1;
  color: hsl(var(--foreground));
  background: hsl(var(--card));
}
</style>
