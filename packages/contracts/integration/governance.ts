/**
 * @nebula-studio/contracts/integration — 发布治理域
 */

export enum PublishStatus {
  DRAFT = 'DRAFT',
  VERSION = 'VERSION',
  APPROVAL = 'APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DEPLOYING = 'DEPLOYING',
  DEPLOYED = 'DEPLOYED',
  ROLLED_BACK = 'ROLLED_BACK',
}

export interface GovernanceRequest {
  requestId: string;
  resourceId: string;
  resourceType: string;
  applicant: string;
  status: PublishStatus;
  submittedAt: string;
  approver?: string;
  comment?: string;
  versionSnapshot?: string;
}

export interface GovernanceApprovalRequest {
  resourceId: string;
  resourceType: string;
  description?: string;
}

export interface GovernanceApprovalDecision {
  requestId: string;
  approved: boolean;
  comment: string;
}

export interface VersionSnapshot {
  snapshotId: string;
  resourceId: string;
  version: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface ReleaseRecord {
  releaseId: string;
  requestId: string;
  resourceId: string;
  status: 'DEPLOYING' | 'DEPLOYED' | 'FAILED' | 'ROLLED_BACK';
  deployedAt?: string;
  deployedBy?: string;
}

export enum GovernancePolicyType {
  RATE_LIMIT = 'RATE_LIMIT',
  CIRCUIT_BREAKER = 'CIRCUIT_BREAKER',
  WHITELIST = 'WHITELIST',
  BLACKLIST = 'BLACKLIST',
}

export interface GovernancePolicy {
  policyId: string;
  resourceId: string;
  policyType: GovernancePolicyType;
  config: Record<string, unknown>;
  enabled: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}
