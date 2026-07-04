/**
 * Auth API mock handlers.
 */
import { http, HttpResponse } from 'msw';

const MOCK_TOKEN = 'mock-jwt-token-nebula-studio';

export const authHandlers = [
  // Integration auth login
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const username = (body.username as string) || 'admin';

    return HttpResponse.json({
      code: 200,
      data: {
        token: MOCK_TOKEN,
        username,
        userId: 1,
        roles: ['admin'],
      },
    });
  }),

  // Integration auth me
  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      code: 200,
      data: {
        username: 'admin',
        userId: 1,
        roles: ['admin'],
      },
    });
  }),

  // Shell auth login (backend)
  http.post('/api/auth/login/backend', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const username = (body.username as string) || 'admin';

    return HttpResponse.json({
      code: 200,
      data: {
        token: MOCK_TOKEN,
        username,
        currentOrgId: 'org-1',
        currentOrgName: '默认组织',
        organizations: [
          {
            id: 'org-1',
            orgName: '默认组织',
            orgCode: 'default',
            primary: true,
          },
        ],
      },
    });
  }),

  // Shell auth me (backend)
  http.get('/api/auth/me/backend', () => {
    return HttpResponse.json({
      code: 200,
      data: {
        username: 'admin',
        userId: '1',
        roles: ['admin'],
        currentOrgId: 'org-1',
        currentOrgCode: 'default',
        currentOrgName: '默认组织',
        organizations: [
          {
            id: 'org-1',
            orgName: '默认组织',
            orgCode: 'default',
            primary: true,
          },
        ],
      },
    });
  }),
];
