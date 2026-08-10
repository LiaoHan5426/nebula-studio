<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import { NebulaTag } from '@nebula-studio/nebula-ui';

import MarkdownPage from '@/components/MarkdownPage.vue';
import {
  getHelpDocument,
  HELP_DOCUMENTS,
  HELP_VERSION,
} from '@/content/productHelp';

const route = useRoute();
const document = computed(() =>
  getHelpDocument(String(route.meta.documentId ?? '')),
);
const index = computed(() =>
  HELP_DOCUMENTS.findIndex((item) => item.id === document.value?.id),
);
const previous = computed(() =>
  index.value > 0 ? HELP_DOCUMENTS[index.value - 1] : undefined,
);
const next = computed(() =>
  index.value >= 0 && index.value < HELP_DOCUMENTS.length - 1
    ? HELP_DOCUMENTS[index.value + 1]
    : undefined,
);
const headings = computed(() =>
  (document.value?.source.match(/^##\s+.+$/gm) ?? []).map((line) => {
    const title = line.replace(/^##\s+/, '').trim();
    return {
      title,
      id: title
        .toLowerCase()
        .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
        .replace(/^-|-$/g, ''),
    };
  }),
);
</script>

<template>
  <main v-if="document" class="product-help-page">
    <header class="document-meta">
      <div>
        <NebulaTag>{{ document.audience }}</NebulaTag>
        <span>版本 {{ HELP_VERSION }}</span>
        <span>更新于 {{ document.updatedAt }}</span>
      </div>
      <a
        href="https://github.com/LiaoHan5426/nebula-studio/issues/new"
        target="_blank"
        rel="noreferrer"
      >
        反馈文档问题
      </a>
    </header>

    <nav v-if="headings.length" class="document-toc" aria-label="本文目录">
      <strong>本文目录</strong>
      <a v-for="heading in headings" :key="heading.id" :href="`#${heading.id}`">
        {{ heading.title }}
      </a>
    </nav>

    <MarkdownPage :source="document.source" />

    <nav class="document-pagination" aria-label="文档翻页">
      <RouterLink v-if="previous" :to="previous.path">
        <span>上一篇</span>
        <strong>{{ previous.title }}</strong>
      </RouterLink>
      <span v-else></span>
      <RouterLink v-if="next" :to="next.path">
        <span>下一篇</span>
        <strong>{{ next.title }}</strong>
      </RouterLink>
    </nav>

    <footer class="document-feedback">
      <div>
        <strong>这篇文档是否解决了问题？</strong>
        <p>若步骤与实际界面不一致，请附上页面名称和操作目标。</p>
      </div>
      <a
        class="feedback-link"
        href="https://github.com/LiaoHan5426/nebula-studio/issues/new"
        target="_blank"
        rel="noreferrer"
      >
        提交反馈
      </a>
    </footer>
  </main>
</template>

<style scoped>
.product-help-page {
  max-width: 960px;
  margin: 0 auto;
}

.document-meta,
.document-meta > div,
.document-pagination,
.document-feedback {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}

.document-meta {
  justify-content: space-between;
  padding-bottom: var(--space-4);
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  border-bottom: 1px solid hsl(var(--border));
}

.document-meta a {
  color: hsl(var(--primary));
}

.document-pagination {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: var(--space-6);
}

.document-toc {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
  padding: var(--space-3) 0;
  font-size: 13px;
}

.document-toc a {
  color: hsl(var(--primary));
  text-decoration: none;
}

.document-pagination a {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-4);
  color: inherit;
  text-decoration: none;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
}

.document-pagination a:last-child {
  text-align: right;
}

.document-pagination span {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.document-feedback {
  justify-content: space-between;
  padding: var(--space-5);
  margin-top: var(--space-5);
  background: hsl(var(--muted) / 30%);
  border-radius: var(--radius-lg);
}

.document-feedback p {
  margin: var(--space-1) 0 0;
  color: hsl(var(--muted-foreground));
}

.feedback-link {
  padding: var(--space-2) var(--space-4);
  color: hsl(var(--foreground));
  text-decoration: none;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
}
</style>
