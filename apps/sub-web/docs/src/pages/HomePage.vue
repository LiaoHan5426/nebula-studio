<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="home-page">
    <section class="hero">
      <h1 class="hero__name">Nebula Studio</h1>
      <p class="hero__text">全栈组件库</p>
      <p class="hero__tagline">
        基于 Vue 3 + TypeScript 的企业级组件库，提供丰富的高质量组件与完善的文档
      </p>
      <div class="hero__actions">
        <RouterLink to="/guide/intro" class="hero__btn hero__btn--brand">
          快速开始
        </RouterLink>
        <RouterLink to="/components/button" class="hero__btn hero__btn--alt">
          组件总览
        </RouterLink>
      </div>
    </section>

    <section class="features">
      <div class="feature">
        <span class="feature__icon">🧩</span>
        <h2 class="feature__title">丰富的组件</h2>
        <p class="feature__details">
          涵盖表单、数据展示、反馈、导航、内容等类别的 20+ 组件
        </p>
      </div>
      <div class="feature">
        <span class="feature__icon">🎨</span>
        <h2 class="feature__title">主题定制</h2>
        <p class="feature__details">
          基于 CSS 变量的主题系统，支持亮色/暗色模式一键切换
        </p>
      </div>
      <div class="feature">
        <span class="feature__icon">📦</span>
        <h2 class="feature__title">TypeScript 优先</h2>
        <p class="feature__details">
          所有组件提供完整类型定义，享受完美的编辑器智能提示
        </p>
      </div>
      <div class="feature">
        <span class="feature__icon">🌙</span>
        <h2 class="feature__title">暗色模式</h2>
        <p class="feature__details">内置暗色模式支持，所有组件均已适配</p>
      </div>
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
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.feature__icon {
  font-size: 28px;
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
