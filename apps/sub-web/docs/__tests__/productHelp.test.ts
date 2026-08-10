import { HELP_DOCUMENTS } from '@/content/productHelp';
import { describe, expect, it } from 'vitest';

describe('product help registry', () => {
  it('keeps document ids and routes unique', () => {
    expect(new Set(HELP_DOCUMENTS.map((item) => item.id)).size).toBe(
      HELP_DOCUMENTS.length,
    );
    expect(new Set(HELP_DOCUMENTS.map((item) => item.path)).size).toBe(
      HELP_DOCUMENTS.length,
    );
  });

  it('covers the first product-help task set', () => {
    const source = HELP_DOCUMENTS.map((item) => item.source).join('\n');
    for (const term of [
      '申请资源',
      '接入',
      '发布资源',
      '审批',
      '插件安装',
      '故障排查',
    ]) {
      expect(source).toContain(term);
    }
  });

  it('provides searchable metadata for every document', () => {
    for (const document of HELP_DOCUMENTS) {
      expect(document.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(document.keywords.length).toBeGreaterThan(0);
      expect(document.source).toContain('# ');
    }
  });
});
