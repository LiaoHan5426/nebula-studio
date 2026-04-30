import { describe, expect, vi, it } from 'vite-plus/test';
import { resolve } from 'node:path';
import { createFileService } from '../../../src/host/services/file.service';
import { BRIDGE_ERROR_CODES } from '../../../src/shared/errors/codes';

describe('host/services/file.service', () => {
  it('reads file content with default encoding', async () => {
    const readFile = vi.fn(async () => 'hello');
    const service = createFileService({ readFile });

    const result = await service.readFile('tmp/test.txt');

    expect(result).toEqual({ content: 'hello', encoding: 'utf-8' });
    expect(readFile).toHaveBeenCalledWith(resolve('tmp/test.txt'), 'utf-8');
  });

  it('rejects path outside allowed roots', async () => {
    const service = createFileService(
      { readFile: vi.fn(async () => 'nope') },
      { allowedRoots: [resolve('safe')] },
    );

    await expect(
      service.readFile(resolve('unsafe', 'a.txt')),
    ).rejects.toMatchObject({
      code: BRIDGE_ERROR_CODES.unauthorized,
    });
  });

  it('maps read errors to NOT_FOUND', async () => {
    const service = createFileService({
      readFile: vi.fn(async () => {
        throw new Error('missing');
      }),
    });

    await expect(service.readFile('missing.txt')).rejects.toMatchObject({
      code: BRIDGE_ERROR_CODES.notFound,
    });
  });
});
