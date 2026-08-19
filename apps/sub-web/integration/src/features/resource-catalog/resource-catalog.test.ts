import {
  InterfaceAuthType,
  InterfaceMethod,
  InterfaceStatus,
  InterfaceType,
} from '@/shared/types';
import { describe, expect, it } from 'vitest';

import { catalogApplyPath, catalogDetailPath } from './catalog-routes';
import {
  dedupeResources,
  mapApiResource,
  mapPluginResource,
  normalizeRequestStatus,
} from './mappers';
import {
  canAdvanceAccessRequest,
  nextAccessRequestStep,
  previousAccessRequestStep,
} from './request-state';
import { DEFAULT_ACCESS_REQUEST_DRAFT } from './types';

describe('catalog routes', () => {
  it('encodes colon resource ids as a single path segment', () => {
    expect(catalogDetailPath('api:orders-api')).toBe(
      '/catalog/api%3Aorders-api',
    );
    expect(catalogApplyPath('api:orders-api')).toBe(
      '/catalog/api%3Aorders-api/apply',
    );
  });
});

describe('resource catalog mappers', () => {
  it('maps an API contract to the shared resource summary', () => {
    const result = mapApiResource({
      interfaceId: 'orders',
      tenantId: 'tenant-a',
      interfaceName: '订单查询',
      interfaceType: InterfaceType.ATOMIC,
      endpointUri: '/orders',
      method: InterfaceMethod.GET,
      authConfig: {
        authType: InterfaceAuthType.JWT,
        allowedTenants: [],
      },
      status: InterfaceStatus.ACTIVE,
      createdAt: '2026-01-01',
      lastModifiedAt: '2026-02-01',
      connectorId: 'http',
      requestMapping: {},
      responseMapping: {},
      requestSchema: { type: 'object', fields: {} },
      responseSchema: { type: 'object', fields: {} },
      subscriptionMode: 'APPROVAL',
    });

    expect(result).toMatchObject({
      id: 'api:orders',
      kind: 'API',
      name: '订单查询',
      availability: 'APPROVAL_REQUIRED',
    });
    expect(result.tags).toContain('JWT');
  });

  it('keeps only one connector when plugin and connector sources overlap', () => {
    const resource = mapPluginResource({
      pluginId: 'http-plugin',
      pluginName: 'HTTP',
      pluginVersion: '1.0.0',
      connectorId: 'http',
    });
    expect(
      dedupeResources([resource, { ...resource, id: 'duplicate' }]),
    ).toHaveLength(1);
  });

  it.each([
    ['PENDING_REVIEW', 'PENDING'],
    ['APPROVED', 'APPROVED'],
    ['NEEDS_INFO', 'NEEDS_INFO'],
    ['DENIED', 'REJECTED'],
    ['EXPIRED', 'EXPIRED'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeRequestStatus(input)).toBe(expected);
  });
});

describe('access request state machine', () => {
  it('requires a meaningful purpose before leaving the first step', () => {
    expect(
      canAdvanceAccessRequest(1, {
        ...DEFAULT_ACCESS_REQUEST_DRAFT,
        purpose: '太短',
      }),
    ).toBe(false);
    expect(
      canAdvanceAccessRequest(1, {
        ...DEFAULT_ACCESS_REQUEST_DRAFT,
        purpose: '用于订单履约异常分析与内部运营跟进',
      }),
    ).toBe(true);
  });

  it('requires sensitivity confirmation and clamps navigation', () => {
    expect(canAdvanceAccessRequest(3, DEFAULT_ACCESS_REQUEST_DRAFT)).toBe(
      false,
    );
    expect(
      canAdvanceAccessRequest(3, {
        ...DEFAULT_ACCESS_REQUEST_DRAFT,
        sensitivityConfirmed: true,
      }),
    ).toBe(true);
    expect(nextAccessRequestStep(4)).toBe(4);
    expect(previousAccessRequestStep(1)).toBe(1);
  });
});
