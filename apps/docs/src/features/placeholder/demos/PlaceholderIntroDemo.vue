<script setup lang="ts">
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
</script>

<template>
  <DocsDemoSection
    title="组件演示占位"
    description="此区域用于放置下一个组件演示页面，建议保持“示例 + 说明 + 结果”结构。"
  >
    <p class="placeholder-tip">
      建议新增 <code>features/&lt;name&gt;</code> 并添加
      <code>feature.ts</code>， 自动接入左侧菜单后按文档风格补齐展示区。
    </p>
  </DocsDemoSection>
</template>

<style scoped>
.placeholder-tip {
  margin: 0;
}
</style>
