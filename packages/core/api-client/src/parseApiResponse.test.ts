import { describe, expect, it } from 'vitest';

import { parseApiResponse } from './parseApiResponse';

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      'content-type': 'application/json',
      ...(init.headers instanceof Headers
        ? Object.fromEntries(init.headers.entries())
        : init.headers),
    },
  });
}

describe('parseApiResponse', () => {
  it('unwraps nebula ApiResponse envelope', async () => {
    const result = await parseApiResponse<{ id: string }>(
      jsonResponse({ code: 0, isSuccess: true, data: { id: '1' } }),
    );

    expect(result.isSuccess).toBe(true);
    expect(result.data).toEqual({ id: '1' });
  });

  it('wraps raw JSON bodies', async () => {
    const result = await parseApiResponse<{ name: string }>(
      jsonResponse({ name: 'demo' }),
    );

    expect(result.isSuccess).toBe(true);
    expect(result.data).toEqual({ name: 'demo' });
  });

  it('throws with server message on HTTP errors', async () => {
    await expect(
      parseApiResponse(
        jsonResponse({ message: 'bad request' }, { status: 400 }),
      ),
    ).rejects.toThrow('bad request');
  });
});
