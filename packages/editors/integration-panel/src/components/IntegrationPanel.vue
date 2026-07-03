<script setup lang="ts">
import { ref } from 'vue';

import { NebulaButton } from '@nebula-studio/nebula-ui/components';

const activeTab = ref<'subscriptions' | 'interfaces'>('interfaces');
const xmlContent = ref<string>('');
const showPreview = ref(false);

const sampleBpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                   xmlns:di="http://www.omg.org/spec/BPMN/20100524/DI"
                   xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
                   id="Definitions_1"
                   targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_Order" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="订单开始"/>
    <bpmn:serviceTask id="Activity_Validate" name="验证订单" camunda:async="true"/>
    <bpmn:serviceTask id="Activity_CheckStock" name="检查库存" camunda:async="true"/>
    <bpmn:exclusiveGateway id="Gateway_Stock" name="库存判断"/>
    <bpmn:serviceTask id="Activity_CreateOrder" name="创建订单" camunda:async="true"/>
    <bpmn:serviceTask id="Activity_Notify" name="发送通知" camunda:async="true"/>
    <bpmn:endEvent id="EndEvent_Success" name="成功"/>
    <bpmn:endEvent id="EndEvent_Failed" name="失败"/>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Activity_Validate"/>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Activity_Validate" targetRef="Activity_CheckStock"/>
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Activity_CheckStock" targetRef="Gateway_Stock"/>
    <bpmn:sequenceFlow id="Flow_4" name="有库存" sourceRef="Gateway_Stock" targetRef="Activity_CreateOrder">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">\${stockAvailable}</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_5" name="无库存" sourceRef="Gateway_Stock" targetRef="EndEvent_Failed"/>
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Activity_CreateOrder" targetRef="Activity_Notify"/>
    <bpmn:sequenceFlow id="Flow_7" sourceRef="Activity_Notify" targetRef="EndEvent_Success"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_Order"/>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const handleSave = () => {
  console.warn('Saving BPMN XML to backend...');
  // 调用后端 API 保存
};
</script>

<template>
  <div class="integration-panel">
    <div class="panel-header">
      <h2 class="panel-title">集成平台</h2>
      <div class="tab-bar">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'interfaces' }"
          @click="activeTab = 'interfaces'"
        >
          接口管理
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'subscriptions' }"
          @click="activeTab = 'subscriptions'"
        >
          库表订阅
        </button>
      </div>
    </div>

    <div class="panel-content">
      <div v-if="activeTab === 'interfaces'" class="interface-section">
        <div class="section-header">
          <h3>BPMN 组合接口编辑器</h3>
          <div class="action-buttons">
            <NebulaButton
              size="sm"
              variant="ghost"
              @click="showPreview = !showPreview"
            >
              {{ showPreview ? '编辑 XML' : '预览流程' }}
            </NebulaButton>
            <NebulaButton size="sm" variant="primary" @click="handleSave">
              保存流程
            </NebulaButton>
          </div>
        </div>

        <div class="editor-container">
          <div v-if="!showPreview" class="bpmn-placeholder">
            <div class="placeholder-icon">📋</div>
            <div class="placeholder-title">BPMN 流程编辑器</div>
            <div class="placeholder-desc">
              基于 bpmn-js 的可视化流程编辑器，用于编排组合接口
            </div>
            <div class="placeholder-features">
              <div class="feature-item">
                <span class="feature-icon">🔗</span>
                <span>Service Task - 调用接口</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🔄</span>
                <span>Script Task - 数据转换</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🔀</span>
                <span>Gateway - 条件分支</span>
              </div>
            </div>
            <div class="placeholder-note">
              编辑器组件需要额外配置 CSS 样式以正确渲染
            </div>
          </div>

          <div v-else class="xml-editor">
            <textarea
              v-model="xmlContent"
              :placeholder="sampleBpmnXml"
              class="xml-textarea"
              spellcheck="false"
            ></textarea>
          </div>
        </div>
      </div>

      <div v-else class="subscription-section">
        <div class="section-header">
          <h3>库表订阅列表</h3>
          <NebulaButton size="sm" variant="primary">新建订阅</NebulaButton>
        </div>
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-text">暂无订阅，点击上方按钮创建</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.integration-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: hsl(var(--card));
  border-radius: 8px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid hsl(var(--border));
}

.panel-title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 700;
  color: hsl(var(--foreground));
}

.tab-bar {
  display: flex;
  gap: 4px;
}

.tab-btn {
  padding: 6px 16px;
  font-size: 14px;
  color: hsl(var(--foreground));
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: hsl(var(--muted));
}

.tab-btn.active {
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.panel-content {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 16px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  transition: background 0.2s;
}

.action-btn.primary {
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
}

.action-btn.primary:hover {
  background: hsl(var(--primary) / 80%);
}

.action-btn.secondary {
  color: hsl(var(--foreground));
  background: hsl(var(--secondary));
  border: 1px solid hsl(var(--border));
}

.action-btn.secondary:hover {
  background: hsl(var(--muted));
}

.editor-container {
  height: calc(100% - 48px);
  min-height: 400px;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.bpmn-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 32px;
  background: linear-gradient(
    135deg,
    hsl(var(--secondary)) 0%,
    hsl(var(--muted)) 100%
  );
}

.placeholder-icon {
  margin-bottom: 16px;
  font-size: 64px;
}

.placeholder-title {
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.placeholder-desc {
  margin-bottom: 24px;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}

.placeholder-features {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  margin-bottom: 24px;
}

.feature-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 16px;
  font-size: 14px;
  color: hsl(var(--foreground));
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.feature-icon {
  font-size: 18px;
}

.placeholder-note {
  font-size: 12px;
  font-style: italic;
  color: hsl(var(--muted-foreground));
}

.xml-editor {
  height: 100%;
}

.xml-textarea {
  width: 100%;
  height: 100%;
  padding: 16px;
  font-family: Monaco, Menlo, 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: hsl(var(--foreground));
  resize: none;
  background: hsl(var(--background));
  border: none;
}

.xml-textarea:focus {
  outline: none;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: hsl(var(--muted-foreground));
}

.empty-icon {
  margin-bottom: 12px;
  font-size: 48px;
}

.empty-text {
  font-size: 14px;
}
</style>
