/**
 * @nebula-studio/contracts/integration — 流程域
 */

export interface FlowDefinition {
  id: string;
  name: string;
  category?: string;
  tenantId: string;
  status: string;
  description?: string;
  bpmnXml?: string;
  currentVersionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FlowCreateRequest {
  name: string;
  category?: string;
  tenantId: string;
  description?: string;
  bpmnXml?: string;
}
