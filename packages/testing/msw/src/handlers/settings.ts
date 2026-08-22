/**
 * Settings API mock handlers.
 */
import { http, HttpResponse } from 'msw';

const mockConfigs = [
  {
    id: 'cfg-1',
    key: 'theme.mode',
    value: 'light',
    scope: 'GLOBAL',
    group: 'appearance',
    type: 'string',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 'cfg-2',
    key: 'theme.primaryColor',
    value: '#409eff',
    scope: 'GLOBAL',
    group: 'appearance',
    type: 'string',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 'cfg-3',
    key: 'language',
    value: 'zh-CN',
    scope: 'GLOBAL',
    group: 'general',
    type: 'string',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
  },
];

const mockUsers = [
  {
    id: 'user-1',
    username: 'admin',
    email: 'admin@nebula.studio',
    realName: '管理员',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    username: 'editor',
    email: 'editor@nebula.studio',
    realName: '编辑',
    status: 'active',
    createdAt: '2026-02-15T10:00:00Z',
  },
];

export const settingsHandlers = [
  // Config CRUD
  http.get('/api/config', ({ request }) => {
    const url = new URL(request.url);
    const scope = url.searchParams.get('scope');
    const group = url.searchParams.get('group');

    let filtered = [...mockConfigs];
    if (scope) {
      filtered = filtered.filter((c) => c.scope === scope);
    }
    if (group) {
      filtered = filtered.filter((c) => c.group === group);
    }

    return HttpResponse.json({ code: 200, data: filtered });
  }),

  http.get('/api/config/:key', ({ params, request }) => {
    const url = new URL(request.url);
    const scope = url.searchParams.get('scope') || 'GLOBAL';
    const config = mockConfigs.find(
      (c) => c.key === params.key && c.scope === scope,
    );

    if (!config) {
      return HttpResponse.json(
        { code: 404, message: 'Config not found' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ code: 200, data: config });
  }),

  http.post('/api/config', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      code: 200,
      data: {
        id: `cfg-${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  http.delete('/api/config/:key', () => {
    return HttpResponse.json({ code: 200, data: null });
  }),

  // System info
  http.get('/api/system/info', () => {
    return HttpResponse.json({
      code: 200,
      data: {
        version: '1.0.0',
        buildTime: '2026-07-01T00:00:00Z',
        nodeVersion: '22.0.0',
        environment: 'development',
      },
    });
  }),

  // Users (settings app)
  http.get('/api/system/users', () => {
    return HttpResponse.json({ code: 200, data: mockUsers });
  }),
];
