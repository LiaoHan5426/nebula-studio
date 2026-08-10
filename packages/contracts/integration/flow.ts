/**
 * @nebula-studio/contracts/integration — 流程域
 */

export interface FlowDefinition {
  bpmnXml?: string;
  category?: string;
  createdAt?: string;
  currentVersionId?: string;
  description?: string;
  id: string;
  name: string;
  status: string;
  tenantId: string;
  updatedAt?: string;
}

export interface FlowCreateRequest {
  bpmnXml?: string;
  category?: string;
  description?: string;
  name: string;
  tenantId: string;
}
