<script setup lang="ts">
import { ref } from 'vue';

const showXmlPreview = ref(false);

const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
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
</script>

<template>
  <div class="integration-feature-panel">
    <h3>BPMN 流程编辑器</h3>
    <p class="feature-description">
      基于 bpmn-js 的可视化流程编辑器，用于编排组合接口。使用 BPMN 2.0
      标准，支持 Camunda/Flowable 等工作流引擎执行。
    </p>

    <div class="demo-section">
      <h4>功能演示</h4>
      <div class="demo-container">
        <div class="bpmn-preview">
          <div class="preview-header">
            <div class="preview-title">订单处理流程示例</div>
            <button
              class="preview-btn"
              @click="showXmlPreview = !showXmlPreview"
            >
              {{ showXmlPreview ? '隐藏 XML' : '显示 XML' }}
            </button>
          </div>
          <div v-if="showXmlPreview" class="xml-content">
            <pre><code>{{ sampleXml }}</code></pre>
          </div>
          <div v-else class="diagram-placeholder">
            <div class="diagram-flow">
              <div class="flow-node start">开始</div>
              <div class="flow-arrow">→</div>
              <div class="flow-node task">验证订单</div>
              <div class="flow-arrow">→</div>
              <div class="flow-node task">检查库存</div>
              <div class="flow-arrow">→</div>
              <div class="flow-node gateway">库存判断</div>
            </div>
            <div class="diagram-branches">
              <div class="branch">
                <div class="branch-label">有库存</div>
                <div class="flow-arrow">→</div>
                <div class="flow-node task success">创建订单</div>
                <div class="flow-arrow">→</div>
                <div class="flow-node task">发送通知</div>
                <div class="flow-arrow">→</div>
                <div class="flow-node end success">成功</div>
              </div>
              <div class="branch">
                <div class="branch-label">无库存</div>
                <div class="flow-arrow">→</div>
                <div class="flow-node end failure">失败</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="feature-list">
      <h4>支持的 BPMN 元素</h4>
      <table class="feature-table">
        <thead>
          <tr>
            <th>元素类型</th>
            <th>图标</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>StartEvent</code></td>
            <td>⭕</td>
            <td>流程开始事件</td>
          </tr>
          <tr>
            <td><code>EndEvent</code></td>
            <td>🔴</td>
            <td>流程结束事件</td>
          </tr>
          <tr>
            <td><code>ServiceTask</code></td>
            <td>📋</td>
            <td>
              服务任务（调用接口），支持
              <code>camunda:async="true"</code> 异步执行
            </td>
          </tr>
          <tr>
            <td><code>ScriptTask</code></td>
            <td>📝</td>
            <td>脚本任务（数据转换）</td>
          </tr>
          <tr>
            <td><code>ExclusiveGateway</code></td>
            <td>🔀</td>
            <td>排他网关（条件分支）</td>
          </tr>
          <tr>
            <td><code>ParallelGateway</code></td>
            <td>⚡</td>
            <td>并行网关（并行执行）</td>
          </tr>
          <tr>
            <td><code>SequenceFlow</code></td>
            <td>➔</td>
            <td>顺序流（支持条件表达式 <code>\${expression}</code>）</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="api-section">
      <h4>后端 API 端点</h4>
      <table class="api-table">
        <thead>
          <tr>
            <th>方法</th>
            <th>路径</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="method post">POST</span></td>
            <td><code>/api/integration/interfaces/composite</code></td>
            <td>创建组合接口</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td><code>/api/integration/interfaces</code></td>
            <td>查询接口列表</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td><code>/api/integration/interfaces/{id}</code></td>
            <td>获取接口详情</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td><code>/api/integration/interfaces/{id}/xml</code></td>
            <td>获取 BPMN XML</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td><code>/api/integration/interfaces/{id}/execute</code></td>
            <td>执行接口</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td><code>/api/integration/subscriptions</code></td>
            <td>创建库表订阅</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="tech-section">
      <h4>技术选型</h4>
      <ul>
        <li><strong>前端编辑器</strong>：bpmn-js 18.x</li>
        <li><strong>后端执行引擎</strong>：Camunda 8.x / Flowable 7.x</li>
        <li><strong>协议规范</strong>：BPMN 2.0</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.integration-feature-panel {
  padding: 16px;
}

.feature-description {
  margin-bottom: 20px;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}

.demo-section {
  margin-bottom: 24px;
}

.demo-section h4 {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.demo-container {
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.bpmn-preview {
  background: hsl(var(--card));
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: hsl(var(--secondary));
  border-bottom: 1px solid hsl(var(--border));
}

.preview-title {
  font-weight: 600;
  color: hsl(var(--foreground));
}

.preview-btn {
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  color: hsl(var(--foreground));
}

.preview-btn:hover {
  background: hsl(var(--muted));
}

.xml-content {
  max-height: 400px;
  padding: 16px;
  overflow: auto;
  background: hsl(var(--background));
}

.xml-content pre {
  margin: 0;
}

.xml-content code {
  font-family: Monaco, Menlo, monospace;
  font-size: 12px;
  color: hsl(var(--foreground));
  white-space: pre-wrap;
}

.diagram-placeholder {
  min-height: 300px;
  padding: 32px;
}

.diagram-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.flow-node {
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
}

.flow-node.start {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 14%);
  border: 2px solid hsl(var(--primary));
}

.flow-node.task {
  color: hsl(var(--accent));
  background: hsl(var(--accent) / 14%);
  border: 2px solid hsl(var(--accent));
}

.flow-node.task.success {
  color: hsl(var(--success));
  background: hsl(var(--success) / 14%);
  border-color: hsl(var(--success));
}

.flow-node.gateway {
  color: hsl(var(--warning));
  background: hsl(var(--warning) / 14%);
  border: 2px solid hsl(var(--warning));
  border-radius: 50%;
}

.flow-node.end {
  color: hsl(var(--destructive));
  background: hsl(var(--destructive) / 14%);
  border: 2px solid hsl(var(--destructive));
}

.flow-node.end.success {
  color: hsl(var(--success));
  background: hsl(var(--success) / 14%);
  border-color: hsl(var(--success));
}

.flow-node.end.failure {
  color: hsl(var(--destructive));
  background: hsl(var(--destructive) / 14%);
  border-color: hsl(var(--destructive));
}

.flow-arrow {
  font-size: 18px;
  color: hsl(var(--muted-foreground));
}

.diagram-branches {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 24px;
  margin-top: 32px;
  border-top: 1px dashed hsl(var(--border));
}

.branch {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.branch-label {
  padding: 2px 8px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--secondary));
  border-radius: 4px;
}

.feature-list {
  margin-bottom: 24px;
}

.feature-list h4 {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.feature-table {
  width: 100%;
  font-size: 13px;
  border-collapse: collapse;
}

.feature-table th,
.feature-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid hsl(var(--border));
}

.feature-table th {
  font-weight: 600;
  color: hsl(var(--foreground));
  background: hsl(var(--secondary));
}

.feature-table td {
  color: hsl(var(--foreground));
}

.feature-table code {
  padding: 2px 4px;
  font-size: 12px;
  background: hsl(var(--secondary));
  border-radius: 2px;
}

.api-section h4 {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.api-table {
  width: 100%;
  font-size: 13px;
  border-collapse: collapse;
}

.api-table th,
.api-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid hsl(var(--border));
}

.api-table th {
  font-weight: 600;
  color: hsl(var(--foreground));
  background: hsl(var(--secondary));
}

.api-table td {
  color: hsl(var(--foreground));
}

.api-table code {
  padding: 2px 4px;
  font-size: 12px;
  background: hsl(var(--secondary));
  border-radius: 2px;
}

.method {
  display: inline-block;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
}

.method.post {
  color: hsl(var(--success));
  background: hsl(var(--success) / 14%);
}

.method.get {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 14%);
}

.tech-section h4 {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.tech-section ul {
  padding-left: 20px;
  margin: 0;
  list-style: disc;
}

.tech-section li {
  padding: 4px 0;
  font-size: 14px;
  color: hsl(var(--foreground));
}

.tech-section strong {
  color: hsl(var(--foreground));
}
</style>
