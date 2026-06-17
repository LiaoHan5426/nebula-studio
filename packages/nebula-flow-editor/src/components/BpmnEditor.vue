<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import BpmnModeler from 'bpmn-js/lib/Modeler';

const props = defineProps<{
  xml?: string;
}>();

const emit = defineEmits<{
  (e: 'update:xml', xml: string): void;
  (e: 'changed'): void;
}>();

const canvasRef = ref<HTMLDivElement>();

let modeler: BpmnModeler | null = null;

const defaultXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                   xmlns:di="http://www.omg.org/spec/BPMN/20100524/DI"
                   xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
                   id="Definitions_1"
                   targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="开始"/>
    <bpmn:serviceTask id="Activity_1" name="调用接口" camunda:async="true"/>
    <bpmn:endEvent id="EndEvent_1" name="结束"/>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Activity_1"/>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Activity_1" targetRef="EndEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1"/>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

onMounted(async () => {
  if (!canvasRef.value) return;

  modeler = new BpmnModeler({
    container: canvasRef.value,
  });

  try {
    await modeler.importXML(props.xml || defaultXml);

    modeler.on('commandStack.changed', () => {
      saveXml();
      emit('changed');
    });
  } catch (err) {
    console.error('Failed to import BPMN diagram:', err);
  }
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
    a.download = 'diagram.bpmn';
    a.click();
    URL.revokeObjectURL(url);
  });
};

const handleZoomIn = () => {
  if (!modeler) return;
  const canvas = modeler.get('canvas') as any;
  canvas.zoom(canvas.zoom() * 1.2);
};

const handleZoomOut = () => {
  if (!modeler) return;
  const canvas = modeler.get('canvas') as any;
  canvas.zoom(canvas.zoom() / 1.2);
};

const handleResetZoom = () => {
  if (!modeler) return;
  const canvas = modeler.get('canvas') as any;
  canvas.zoom('fit-viewport');
};

watch(
  () => props.xml,
  async (newXml) => {
    if (!modeler || !newXml) return;
    try {
      await modeler.importXML(newXml);
    } catch (err) {
      console.error('Failed to import new XML:', err);
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
  <div class="bpmn-editor-wrapper">
    <div class="toolbar">
      <button class="toolbar-btn" @click="handleZoomIn" title="放大">
        <span>+</span>
      </button>
      <button class="toolbar-btn" @click="handleZoomOut" title="缩小">
        <span>-</span>
      </button>
      <button class="toolbar-btn" @click="handleResetZoom" title="适应画布">
        <span>⊞</span>
      </button>
      <div class="toolbar-divider"></div>
      <button
        class="toolbar-btn primary"
        @click="handleDownload"
        title="下载 BPMN"
      >
        <span>↓</span>
      </button>
    </div>

    <div class="editor-container">
      <div ref="canvasRef" class="bpmn-canvas"></div>
    </div>
  </div>
</template>

<style>
.bpmn-editor-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.toolbar {
  display: flex;
  gap: 4px;
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
  background: hsl(var(--card));
}

/* BPMN.js 样式 */
.bpmn-js .djs-palette {
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.bpmn-js .djs-palette .entry {
  width: 26px;
  height: 26px;
  margin: 4px;
}

.bpmn-js .djs-palette .entry:hover {
  background: hsl(var(--muted));
}
</style>
