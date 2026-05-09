<script setup lang="ts">
import { NebulaPane } from '@nebula-studio/nebula-ui';
import DocsApiTable from '../../components/DocsApiTable.vue';
import DocsDemoSection from '../../components/DocsDemoSection.vue';

const apiRows = [
  {
    name: 'feature.ts',
    type: 'DocsFeatureDefinition',
    description: '定义组件文档菜单项、标题、描述与挂载组件。',
  },
  {
    name: 'component',
    type: 'Vue Component',
    description: '文档页面主体组件，建议内部组织为示例区与说明区。',
  },
];
</script>

<template>
  <section class="placeholder-stack">
    <DocsDemoSection
      title="组件演示占位"
      description="此区域用于放置下一个组件演示页面，建议保持“示例 + 说明 + 结果”结构。"
    >
      <p class="placeholder-tip">
        建议新增 <code>features/&lt;name&gt;</code> 并添加
        <code>feature.ts</code>， 自动接入左侧菜单后按文档风格补齐展示区。
      </p>
    </DocsDemoSection>
    <NebulaPane class="placeholder-card" title="开发建议">
      <p>可按 Element Plus 风格补充 API、示例代码块与注意事项。</p>
    </NebulaPane>
    <DocsApiTable title="接入约定" :rows="apiRows" />
  </section>
</template>

<style scoped>
.placeholder-stack {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.placeholder-card {
  margin-top: 0;
}

.placeholder-tip {
  margin: 0;
}

.placeholder-card p {
  margin: 0;
  color: hsl(var(--muted-foreground));
}
</style>
