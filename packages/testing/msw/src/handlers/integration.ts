/**
 * Integration API mock handlers.
 */
import { http, HttpResponse } from 'msw';

const mockFlows = [
  {
    id: 'flow-1',
    name: '数据同步流程',
    category: 'data-sync',
    status: 'RUNNING',
    description: '定时同步数据库表数据',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-07-01T10:30:00Z',
  },
  {
    id: 'flow-2',
    name: 'API 网关路由',
    category: 'api-gateway',
    status: 'STOPPED',
    description: 'REST API 路由转发',
    createdAt: '2026-02-20T14:00:00Z',
    updatedAt: '2026-06-28T16:00:00Z',
  },
  {
    id: 'flow-3',
    name: '消息队列消费',
    category: 'messaging',
    status: 'RUNNING',
    description: 'Kafka 消息消费处理',
    createdAt: '2026-03-10T09:00:00Z',
    updatedAt: '2026-07-02T11:00:00Z',
  },
];

const mockSubscriptions = [
  {
    id: 'sub-1',
    name: '用户表订阅',
    tableName: 'users',
    schemaName: 'public',
    status: 'ACTIVE',
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'sub-2',
    name: '订单表订阅',
    tableName: 'orders',
    schemaName: 'public',
    status: 'PAUSED',
    createdAt: '2026-03-15T14:00:00Z',
  },
];

export const integrationHandlers = [
  // Flows CRUD
  http.get('/api/flows', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '10');
    const start = (page - 1) * pageSize;

    return HttpResponse.json({
      code: 200,
      data: {
        records: mockFlows.slice(start, start + pageSize),
        total: mockFlows.length,
        size: pageSize,
        current: page,
        pages: Math.ceil(mockFlows.length / pageSize),
      },
    });
  }),

  http.get('/api/flows/:id', ({ params }) => {
    const flow = mockFlows.find((f) => f.id === params.id);
    if (!flow) {
      return HttpResponse.json(
        { code: 404, message: 'Flow not found' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ code: 200, data: flow });
  }),

  http.post('/api/flows', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      code: 200,
      data: { id: `flow-${Date.now()}`, ...body, status: 'DRAFT' },
    });
  }),

  http.put('/api/flows/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const flow = mockFlows.find((f) => f.id === params.id);
    return HttpResponse.json({
      code: 200,
      data: { ...flow, ...body },
    });
  }),

  http.delete('/api/flows/:id', () => {
    return HttpResponse.json({ code: 200, data: null });
  }),

  // Subscriptions
  http.get('/api/subscribe/camel', () => {
    return HttpResponse.json({ code: 200, data: mockSubscriptions });
  }),

  http.get('/api/subscribe/camel/:id', ({ params }) => {
    const sub = mockSubscriptions.find((s) => s.id === params.id);
    if (!sub) {
      return HttpResponse.json(
        { code: 404, message: 'Subscription not found' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ code: 200, data: sub });
  }),

  http.post('/api/subscribe/camel', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      code: 200,
      data: { id: `sub-${Date.now()}`, ...body, status: 'ACTIVE' },
    });
  }),

  // Console
  http.get('/api/console/health', () => {
    return HttpResponse.json({
      code: 200,
      data: { status: 'UP', version: '1.0.0-mock' },
    });
  }),

  // Monitor
  http.get('/api/monitor/stats', () => {
    return HttpResponse.json({
      code: 200,
      data: {
        activeFlows: 2,
        totalFlows: 3,
        activeSubscriptions: 1,
        totalSubscriptions: 2,
        uptime: '72h 15m',
      },
    });
  }),
];
