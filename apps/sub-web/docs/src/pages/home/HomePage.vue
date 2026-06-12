<script setup lang="ts">
import { inject } from 'vue';
import { NebulaButton } from '@nebula-studio/nebula-ui';
import { DOCS_NAVIGATE_TO_FEATURE } from '../../docsNavigation';

const navigateToPage = inject(DOCS_NAVIGATE_TO_FEATURE, null);
</script>

<template>
  <div class="home-page">
    <div class="home-hero">
      <h1 class="home-hero__title">Nebula Studio 文档中心</h1>
      <p class="home-hero__subtitle">
        统一展示前端组件与后端框架的示例、API 与最佳实践
      </p>
    </div>

    <div class="home-cards">
      <div class="home-card" @click="navigateToPage?.('backend')">
        <div class="home-card__icon home-card__icon--backend">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        </div>
        <h2 class="home-card__title">后端文档</h2>
        <p class="home-card__desc">
          Java / Spring Boot 框架文档，包括 RestService 注解、ApiResponse
          响应封装、BaseController 基类、读写分离 Service 等核心组件。
        </p>
        <ul class="home-card__tags" aria-label="后端文档涵盖范围">
          <li>Spring Boot</li>
          <li>Core / Database</li>
          <li>Security / System</li>
        </ul>
        <NebulaButton variant="secondary" class="home-card__btn">
          进入后端文档 →
        </NebulaButton>
      </div>

      <div class="home-card" @click="navigateToPage?.('frontend')">
        <div class="home-card__icon home-card__icon--frontend">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5Z" />
            <path d="m2 17 10 5 10-5" />
            <path d="m2 12 10 5 10-5" />
          </svg>
        </div>
        <h2 class="home-card__title">前端文档</h2>
        <p class="home-card__desc">
          Vue 3 组件库文档，包括 NebulaTable、NebulaPagination、Monaco
          Editor、Reader、Notify 等组件的示例与 API 说明。
        </p>
        <ul class="home-card__tags" aria-label="前端文档涵盖范围">
          <li>Vue 3</li>
          <li>Table / Pagination</li>
          <li>Monaco / Notify</li>
        </ul>
        <NebulaButton variant="secondary" class="home-card__btn">
          进入前端文档 →
        </NebulaButton>
      </div>
    </div>

    <div class="home-footer">
      <p>选择上方入口进入对应文档模块，或通过左侧菜单直接浏览。</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  padding: 3rem 1.5rem;
  background: hsl(var(--background));
}

.home-hero {
  padding: 2rem 1rem;
  text-align: center;
}

.home-hero__title {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.2;
  color: hsl(var(--foreground));
}

.home-hero__subtitle {
  margin: 0.75rem 0 0;
  font-size: 1.15rem;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
}

.home-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.75rem;
  max-width: 900px;
  padding: 1rem 0;
  margin: 0 auto;
}

.home-card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.75rem;
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover {
    border-color: hsl(var(--accent));
    box-shadow: 0 4px 20px hsl(var(--accent) / 15%);
  }
}

.home-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;

  &--backend {
    color: hsl(var(--accent));
    background: hsl(var(--accent) / 20%);
  }

  &--frontend {
    color: hsl(var(--accent));
    background: hsl(var(--accent) / 15%);
  }
}

.home-card__title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1.3;
  color: hsl(var(--foreground));
}

.home-card__desc {
  flex: 1;
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.55;
  color: hsl(var(--muted-foreground));
}

.home-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  padding: 0;
  margin: 0;
  list-style: none;

  li {
    padding: 0.2rem 0.55rem;
    font-size: 0.78rem;
    font-weight: 600;
    color: hsl(var(--foreground));
    background: hsl(var(--muted) / 72%);
    border: 1px solid hsl(var(--border) / 72%);
    border-radius: 999px;
  }
}

.home-card__btn {
  align-self: flex-start;
  margin-top: 0.5rem;
}

.home-footer {
  padding: 2rem 1rem;
  font-size: 0.9rem;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

@media (width <= 640px) {
  .home-page {
    padding: 2rem 1rem;
  }

  .home-hero__title {
    font-size: 1.8rem;
  }

  .home-hero__subtitle {
    font-size: 1rem;
  }

  .home-cards {
    grid-template-columns: 1fr;
  }
}
</style>
