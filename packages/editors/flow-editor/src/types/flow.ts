export interface FlowStep {
  id: string;
  order: number;
  name: string;
  type:
    | 'serviceTask'
    | 'userTask'
    | 'exclusiveGateway'
    | 'parallelGateway'
    | 'scriptTask';
  interfaceId?: string;
  inputMapping?: string;
  outputMapping?: string;
  errorHandling?: {
    onError: string;
    fallbackInterfaceId?: string;
    retryCount: number;
    retryDelayMs: number;
  };
  condition?: string;
}

export interface FlowConnection {
  sourceId: string;
  targetId: string;
  type: 'normal' | 'success' | 'failure';
}

export interface FlowDefinition {
  id: string;
  name: string;
  description?: string;
  xml: string;
}

export type BpmnElementType =
  | 'bpmn:ServiceTask'
  | 'bpmn:UserTask'
  | 'bpmn:ExclusiveGateway'
  | 'bpmn:ParallelGateway'
  | 'bpmn:ScriptTask'
  | 'bpmn:StartEvent'
  | 'bpmn:EndEvent'
  | 'bpmn:SequenceFlow';

export interface BpmnStepData {
  interfaceId?: string;
  inputMapping?: string;
  outputMapping?: string;
  retryCount?: number;
  retryDelayMs?: number;
  condition?: string;
  onError?: string;
  fallbackInterfaceId?: string;
}
