<script setup lang="ts">
import { NebulaAnchor } from '@nebula-studio/nebula-ui';
import { agentDocAnchorItems } from './demos/agentDocAnchors';
import SqlAgentDemo from './demos/sql-agent/demo.vue';
import SqlAgentApiSection from './demos/sql-agent/api-section.vue';
import { sqlAgentInfo } from './demos/agentInfo';
</script>

<template>
  <div class="agent-layout">
    <NebulaAnchor
      :items="[...agentDocAnchorItems]"
      title="On This Page"
      responsive
      back-top
      back-top-mode="float"
    />
    <div class="agent-feature">
      <!-- Agent 介绍 -->
      <div class="agent-intro">
        <h2>{{ sqlAgentInfo.title }}</h2>
        <p>{{ sqlAgentInfo.description }}</p>
        <div v-if="sqlAgentInfo.features" class="features-list">
          <h3>主要功能</h3>
          <ul>
            <li v-for="feature in sqlAgentInfo.features" :key="feature">
              {{ feature }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Agent 演示 -->
      <SqlAgentDemo />

      <!-- Agent API 文档 -->
      <SqlAgentApiSection />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.agent-layout {
  position: relative;
}

.agent-feature {
  display: grid;
  gap: 0.9rem;
  min-width: 0;
}

.agent-feature > :deep(section) {
  min-width: 0;
  max-width: 100%;
}

.agent-feature > :deep(section .demo-section) {
  max-width: 100%;
}

.agent-intro {
  padding: 16px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;

  h2 {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  p {
    margin: 0 0 12px;
    font-size: 14px;
    color: hsl(var(--muted-foreground));
    line-height: 1.6;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 500;
    color: hsl(var(--foreground));
  }
}

.features-list ul {
  margin: 0;
  padding-left: 20px;

  li {
    margin-bottom: 4px;
    font-size: 14px;
    color: hsl(var(--muted-foreground));
  }
}
</style>
