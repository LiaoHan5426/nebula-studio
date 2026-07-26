<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="home-page">
    <section class="hero">
      <p class="hero__eyebrow">Help center · v0.0.0</p>
      <h1 class="hero__name">Nebula Studio 帮助中心</h1>
      <p class="hero__text">完成任务，也理解平台</p>
      <p class="hero__tagline">
        产品帮助面向消费者、提供方和管理员；开发者参考保留组件示例、体验模式和实现规范。
      </p>
      <div class="hero__actions">
        <RouterLink
          to="/help/consumer/getting-started"
          class="hero__btn hero__btn--brand"
        >
          进入产品帮助
        </RouterLink>
        <RouterLink
          to="/reference/component-guidelines"
          class="hero__btn hero__btn--alt"
        >
          打开开发者参考
        </RouterLink>
      </div>
    </section>

    <section class="features">
      <RouterLink to="/help/consumer/find-request" class="feature">
        <span class="feature__label">消费者</span>
        <h2 class="feature__title">查找、申请与接入资源</h2>
        <p class="feature__details">
          从资源目录到申请状态，再到获批后的接入信息。
        </p>
      </RouterLink>
      <RouterLink to="/help/provider/getting-started" class="feature">
        <span class="feature__label">提供方</span>
        <h2 class="feature__title">登记、发布与响应申请</h2>
        <p class="feature__details">
          使用提供方工作台管理服务、版本和消费者待办。
        </p>
      </RouterLink>
      <RouterLink to="/help/admin/getting-started" class="feature">
        <span class="feature__label">管理员</span>
        <h2 class="feature__title">审批、插件与平台治理</h2>
        <p class="feature__details">
          从异常和风险开始，处理权限、配置与审计任务。
        </p>
      </RouterLink>
      <RouterLink to="/reference/component-guidelines" class="feature">
        <span class="feature__label">开发者</span>
        <h2 class="feature__title">组件、模式与代码示例</h2>
        <p class="feature__details">包含可访问性、键盘、响应式和组合规范。</p>
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 960px;
  padding: 40px 24px;
  margin: 0 auto;
}

.hero {
  padding: 48px 0;
  text-align: center;
}

.hero__name {
  font-size: 32px;
  font-weight: 700;
  color: hsl(var(--foreground));
}

.hero__eyebrow {
  font-size: 12px;
  font-weight: 800;
  color: hsl(var(--primary));
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.hero__text {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 600;
  color: hsl(var(--primary));
}

.hero__tagline {
  max-width: 480px;
  margin-inline: auto;
  margin-top: 12px;
  font-size: 16px;
  color: hsl(var(--muted-foreground));
}

.hero__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.hero__btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border-radius: 6px;
  transition: opacity 0.2s;
}

.hero__btn:hover {
  opacity: 0.85;
}

.hero__btn--brand {
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
}

.hero__btn--alt {
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.feature {
  padding: 20px;
  color: inherit;
  text-decoration: none;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.feature__label {
  font-size: 11px;
  font-weight: 800;
  color: hsl(var(--primary));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.feature__title {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.feature__details {
  margin-top: 4px;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}
</style>
