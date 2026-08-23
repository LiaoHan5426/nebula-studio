<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';

type Journey = 'admin' | 'consumer' | 'developer' | 'provider';
const activeJourney = ref<Journey>('consumer');
const journeys = [
  { id: 'consumer', label: '我要使用资源' },
  { id: 'provider', label: '我要发布能力' },
  { id: 'admin', label: '我要治理平台' },
  { id: 'developer', label: '我要构建界面' },
] as const;
const journeyContent = computed(
  () =>
    ({
      consumer: {
        eyebrow: 'Consumer journey',
        title: '从发现资源到完成接入',
        description: '按照真实任务顺序了解搜索、申请、审批状态与接入凭据。',
        to: '/help/consumer/getting-started',
        action: '开始消费者指南',
        steps: ['查找合适资源', '说明用途与期限', '跟进审批并接入'],
      },
      provider: {
        eyebrow: 'Provider journey',
        title: '把服务安全地交付给组织',
        description: '完成登记、版本检查、发布申请和消费者响应。',
        to: '/help/provider/getting-started',
        action: '开始提供方指南',
        steps: ['登记服务契约', '准备并校验版本', '发布并处理申请'],
      },
      admin: {
        eyebrow: 'Admin journey',
        title: '从风险和待办开始治理',
        description: '聚焦访问审批、插件安全、权限边界与平台审计。',
        to: '/help/admin/getting-started',
        action: '开始管理员指南',
        steps: ['确认待办优先级', '审查权限与策略', '复核审计与异常'],
      },
      developer: {
        eyebrow: 'Design system',
        title: '使用统一模式构建产品界面',
        description: '浏览 token、组件状态、页面模式和可访问性约束。',
        to: '/reference/component-guidelines',
        action: '打开开发者参考',
        steps: ['选择页面模式', '组合标准组件', '验证主题与键盘操作'],
      },
    })[activeJourney.value],
);
</script>

<template>
  <main class="docs-home">
    <section class="docs-hero">
      <div class="docs-hero__copy">
        <p class="docs-hero__eyebrow">Nebula knowledge center</p>
        <h1>先选择任务，再阅读文档</h1>
        <p class="docs-hero__lead">
          面向消费者、提供方、管理员与开发者的统一帮助中心。内容按工作流组织，而不是按功能菜单堆叠。
        </p>
        <div class="docs-hero__actions">
          <RouterLink to="/help/consumer/getting-started" class="primary-link"
            >快速开始</RouterLink
          >
          <RouterLink to="/patterns/catalog" class="secondary-link"
            >浏览体验模式</RouterLink
          >
        </div>
      </div>
      <aside class="docs-hero__status" aria-label="文档状态">
        <span>当前版本</span><strong>v0.0.0</strong>
        <p>产品帮助、设计系统与开发者参考在同一版本中维护。</p>
        <RouterLink to="/design/theme-matrix">检查主题矩阵 →</RouterLink>
      </aside>
    </section>

    <section class="journey" aria-labelledby="journey-title">
      <header>
        <p>Guided paths</p>
        <h2 id="journey-title">你今天要完成什么？</h2>
      </header>
      <div class="journey__body">
        <div class="journey__tabs" role="tablist" aria-label="选择任务角色">
          <button
            v-for="item in journeys"
            :key="item.id"
            type="button"
            role="tab"
            :aria-selected="activeJourney === item.id"
            :class="{ 'is-active': activeJourney === item.id }"
            @click="activeJourney = item.id"
          >
            {{ item.label }}
          </button>
        </div>
        <article class="journey__detail" role="tabpanel">
          <p>{{ journeyContent.eyebrow }}</p>
          <h3>{{ journeyContent.title }}</h3>
          <span>{{ journeyContent.description }}</span>
          <ol>
            <li v-for="(step, index) in journeyContent.steps" :key="step">
              <b>{{ index + 1 }}</b
              >{{ step }}
            </li>
          </ol>
          <RouterLink :to="journeyContent.to"
            >{{ journeyContent.action }} →</RouterLink
          >
        </article>
      </div>
    </section>

    <section class="docs-resources" aria-label="常用入口">
      <RouterLink to="/help/troubleshooting"
        ><span>问题排查</span><strong>恢复登录、加载与权限问题</strong
        ><b>→</b></RouterLink
      >
      <RouterLink to="/patterns/catalog"
        ><span>页面模式</span><strong>列表、详情、设置与编辑器布局</strong
        ><b>→</b></RouterLink
      >
      <RouterLink to="/design/tokens"
        ><span>设计系统</span><strong>语义 token 与组件状态</strong
        ><b>→</b></RouterLink
      >
    </section>
  </main>
</template>

<style scoped>
.docs-home {
  display: grid;
  gap: clamp(24px, 4vw, 48px);
  max-width: 1180px;
  padding: clamp(24px, 5vw, 68px);
  margin: 0 auto;
}
.docs-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(260px, 0.55fr);
  gap: clamp(28px, 6vw, 80px);
  align-items: end;
  padding-bottom: clamp(28px, 5vw, 56px);
  border-bottom: 1px solid hsl(var(--border));
}
.docs-hero__eyebrow,
.journey header p,
.journey__detail > p {
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  color: hsl(var(--primary));
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
.docs-hero h1 {
  max-width: 720px;
  margin: 12px 0 0;
  font-size: clamp(38px, 6vw, 68px);
  line-height: 1.02;
  letter-spacing: -0.055em;
}
.docs-hero__lead {
  max-width: 660px;
  margin: 22px 0 0;
  font-size: clamp(16px, 2vw, 19px);
  line-height: 1.75;
  color: hsl(var(--muted-foreground));
}
.docs-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
}
.primary-link,
.secondary-link {
  display: inline-flex;
  padding: 11px 18px;
  font-weight: 700;
  text-decoration: none;
  border-radius: var(--radius-md);
}
.primary-link {
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
}
.secondary-link {
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}
.docs-hero__status {
  padding: 22px;
  background: hsl(var(--muted) / 22%);
  border-left: 3px solid hsl(var(--primary));
}
.docs-hero__status span {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}
.docs-hero__status strong {
  display: block;
  margin-top: 4px;
  font-size: 25px;
}
.docs-hero__status p {
  line-height: 1.55;
  color: hsl(var(--muted-foreground));
}
.docs-hero__status a,
.journey__detail a {
  font-weight: 700;
  color: hsl(var(--primary));
  text-decoration: none;
}
.journey > header h2 {
  margin: 8px 0 0;
  font-size: clamp(24px, 3vw, 34px);
  letter-spacing: -0.025em;
}
.journey__body {
  display: grid;
  grid-template-columns: minmax(220px, 0.42fr) minmax(0, 1fr);
  margin-top: 22px;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
}
.journey__tabs {
  display: grid;
  align-content: start;
  padding: 10px;
  background: hsl(var(--muted) / 22%);
  border-right: 1px solid hsl(var(--border));
}
.journey__tabs button {
  padding: 15px 16px;
  font: inherit;
  font-weight: 650;
  color: hsl(var(--muted-foreground));
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: var(--radius-md);
}
.journey__tabs button:hover,
.journey__tabs button.is-active {
  color: hsl(var(--foreground));
  background: hsl(var(--card));
}
.journey__tabs button.is-active {
  color: hsl(var(--primary));
}
.journey__detail {
  min-height: 310px;
  padding: clamp(24px, 4vw, 44px);
}
.journey__detail h3 {
  margin: 10px 0 8px;
  font-size: clamp(24px, 3vw, 36px);
  letter-spacing: -0.03em;
}
.journey__detail > span {
  color: hsl(var(--muted-foreground));
}
.journey__detail ol {
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 28px 0;
  list-style: none;
}
.journey__detail li {
  display: flex;
  gap: 12px;
  align-items: center;
}
.journey__detail li b {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  font-size: 11px;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 10%);
  border-radius: 50%;
}
.docs-resources {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid hsl(var(--border));
  border-bottom: 1px solid hsl(var(--border));
}
.docs-resources a {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
  padding: 22px;
  color: inherit;
  text-decoration: none;
}
.docs-resources a + a {
  border-left: 1px solid hsl(var(--border));
}
.docs-resources span {
  grid-column: 1;
  font-size: 11px;
  font-weight: 800;
  color: hsl(var(--primary));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.docs-resources strong {
  grid-column: 1;
}
.docs-resources b {
  grid-row: 1 / span 2;
  grid-column: 2;
  align-self: center;
  color: hsl(var(--muted-foreground));
}
@media (width <= 760px) {
  .docs-hero,
  .journey__body,
  .docs-resources {
    grid-template-columns: 1fr;
  }
  .journey__tabs {
    border-right: 0;
    border-bottom: 1px solid hsl(var(--border));
  }
  .docs-resources a + a {
    border-top: 1px solid hsl(var(--border));
    border-left: 0;
  }
}
</style>
