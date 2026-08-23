import type { FrontendRuntimeEntry } from '@nebula-studio/contracts/system';

import { describe, expect, it } from 'vitest';

import {
  integrableOrderFromRuntime,
  overlayRuntimeOnWindowsCatalog,
} from '../platform/integratedApps';

const docs: FrontendRuntimeEntry = {
  driver: 'federation',
  electronEnabled: true,
  id: 'docs',
  integratable: false,
  name: '文档·runtime',
  roles: ['public'],
  sortOrder: 10,
  source: 'frontend',
  webEnabled: true,
};

const integration: FrontendRuntimeEntry = {
  driver: 'native',
  electronEnabled: true,
  id: 'integration',
  integratable: true,
  name: '集成平台·runtime',
  roles: ['authenticated'],
  sortOrder: 20,
  source: 'frontend',
  webEnabled: true,
};

const settings: FrontendRuntimeEntry = {
  driver: 'native',
  electronEnabled: true,
  id: 'settings',
  integratable: false,
  name: '设置·runtime',
  roles: ['authenticated'],
  sortOrder: 30,
  source: 'frontend',
  webEnabled: true,
};

describe('shell catalog from frontend runtime', () => {
  it('overlays runtime labels onto chrome catalog ids', () => {
    const metas = overlayRuntimeOnWindowsCatalog([docs, integration, settings]);
    expect(metas.find((meta) => meta.id === 'docs')?.label).toBe(
      '文档·runtime',
    );
    expect(metas.find((meta) => meta.id === 'settings')?.integratable).toBe(
      false,
    );
    expect(metas.find((meta) => meta.id === 'integration')?.integratable).toBe(
      true,
    );
  });

  it('keeps chrome catalog entries when runtime only has docs', () => {
    const metas = overlayRuntimeOnWindowsCatalog([docs]);
    expect(metas.find((meta) => meta.id === 'settings')?.label).toBe('设置');
    expect(metas.find((meta) => meta.id === 'integration')?.label).toBe(
      '集成平台',
    );
  });

  it('orders the integration grid from runtime sortOrder, skipping sidebar-only apps', () => {
    expect(integrableOrderFromRuntime([settings, docs, integration])).toEqual([
      'integration',
    ]);
  });

  it('appends iframe and external runtime apps to the catalog', () => {
    const iframe: FrontendRuntimeEntry = {
      driver: 'iframe',
      electronEnabled: true,
      id: 'iframe-demo',
      integratable: true,
      manifestUrl: '/iframe-guest.html',
      name: 'iframe 示例',
      roles: ['authenticated'],
      sortOrder: 80,
      source: 'frontend',
      webEnabled: true,
    };
    const metas = overlayRuntimeOnWindowsCatalog([docs, integration, iframe]);
    expect(metas.find((meta) => meta.id === 'iframe-demo')?.label).toBe(
      'iframe 示例',
    );
    expect(
      integrableOrderFromRuntime([settings, docs, integration, iframe]),
    ).toEqual(['integration', 'iframe-demo']);
  });

  it('adds dynamic federation applications to the launcher', () => {
    const studio: FrontendRuntimeEntry = {
      driver: 'federation',
      electronEnabled: true,
      id: 'low-code-studio',
      integratable: true,
      name: '低代码工作室',
      roles: ['authenticated'],
      sortOrder: 70,
      source: 'frontend',
      webEnabled: true,
    };
    const metas = overlayRuntimeOnWindowsCatalog([integration, studio]);
    expect(metas.find((meta) => meta.id === 'low-code-studio')?.label).toBe(
      '低代码工作室',
    );
    expect(integrableOrderFromRuntime([integration, studio])).toEqual([
      'integration',
      'low-code-studio',
    ]);
  });
});
