/** Starter BPMN for integration platform — includes diagram layout so shapes render. */
export const INTEGRATION_STARTER_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                   xmlns:di="http://www.omg.org/spec/BPMN/20100524/DI"
                   xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
                   id="Definitions_integration"
                   targetNamespace="http://nebula.io/schema/integration/bpmn">
  <bpmn:process id="IntegrationProcess" name="集成流程" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="开始"/>
    <bpmn:serviceTask id="AtomicInterface_1" name="Query Orders" camunda:topic="intf-orders-query"/>
    <bpmn:endEvent id="EndEvent_1" name="结束"/>
    <bpmn:sequenceFlow id="Flow_start" sourceRef="StartEvent_1" targetRef="AtomicInterface_1"/>
    <bpmn:sequenceFlow id="Flow_end" sourceRef="AtomicInterface_1" targetRef="EndEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="IntegrationProcess">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="180" y="182" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="AtomicInterface_1_di" bpmnElement="AtomicInterface_1">
        <dc:Bounds x="270" y="160" width="120" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="452" y="182" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_start_di" bpmnElement="Flow_start">
        <di:waypoint x="216" y="200"/>
        <di:waypoint x="270" y="200"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_end_di" bpmnElement="Flow_end">
        <di:waypoint x="390" y="200"/>
        <di:waypoint x="452" y="200"/>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

export function isBlankBpmn(xml?: string | null): boolean {
  if (xml === null || xml === undefined) return true;
  const trimmed = xml.trim();
  if (!trimmed) return true;
  return (
    !trimmed.includes('bpmn:process') && !trimmed.includes('bpmn2:process')
  );
}
