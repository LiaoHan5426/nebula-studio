export interface FlowStep {
  condition?: string;
  errorHandling?: {
    fallbackInterfaceId?: string;
    onError: string;
    retryCount: number;
    retryDelayMs: number;
  };
  id: string;
  inputMapping?: string;
  interfaceId?: string;
  name: string;
  order: number;
  outputMapping?: string;
  type:
    | 'exclusiveGateway'
    | 'parallelGateway'
    | 'scriptTask'
    | 'serviceTask'
    | 'userTask';
}

export interface FlowConnection {
  sourceId: string;
  targetId: string;
  type: 'failure' | 'normal' | 'success';
}

export interface FlowDefinition {
  description?: string;
  id: string;
  name: string;
  xml: string;
}

export type BpmnElementType =
  | 'bpmn:EndEvent'
  | 'bpmn:ExclusiveGateway'
  | 'bpmn:ParallelGateway'
  | 'bpmn:ScriptTask'
  | 'bpmn:SequenceFlow'
  | 'bpmn:ServiceTask'
  | 'bpmn:StartEvent'
  | 'bpmn:UserTask';

export interface BpmnStepData {
  condition?: string;
  fallbackInterfaceId?: string;
  inputMapping?: string;
  interfaceId?: string;
  onError?: string;
  outputMapping?: string;
  retryCount?: number;
  retryDelayMs?: number;
}
