<script setup lang="ts">
import { inject } from 'vue';
import { NebulaButton, NebulaAnchor } from '@nebula-studio/nebula-ui';
import { DOCS_NAVIGATE_TO_FEATURE } from '../../docsNavigation';

const navigateToPage = inject(DOCS_NAVIGATE_TO_FEATURE, null);

const anchorItems = [
  { id: 'overview', label: '概览' },
  { id: 'core-module', label: 'Core 模块' },
  { id: 'database-module', label: 'Database 模块' },
  { id: 'security-module', label: 'Security 模块' },
  { id: 'system-module', label: 'System 模块' },
];

const modules = [
  {
    id: 'core-module',
    title: 'Core 模块',
    description: '核心框架组件',
    path: 'nebula-core',
    items: [
      { name: '@RestService', desc: 'RESTful 服务注解，替代 @RestController' },
      {
        name: 'ApiResponse<T>',
        desc: '统一响应封装，包含 code, data, message',
      },
      { name: 'BaseController', desc: '控制器基类，提供通用 CRUD 接口' },
      { name: 'BaseService', desc: '服务层基类' },
      { name: 'ReadService', desc: '读操作服务接口' },
      { name: 'WriteService', desc: '写操作服务接口' },
      { name: 'IdGenerator', desc: 'ID 生成器接口（默认 Snowflake）' },
      { name: 'GlobalExceptionHandler', desc: '全局异常处理器' },
    ],
  },
  {
    id: 'database-module',
    title: 'Database 模块',
    description: '数据库访问与元数据组件',
    path: 'nebula-database',
    items: [
      { name: 'DatabaseProperties', desc: '多数据源配置属性' },
      { name: 'FlywayModuleAutoConfiguration', desc: 'Flyway 数据库迁移配置' },
      { name: 'SnowflakeIdGenerator', desc: 'Snowflake 分布式 ID 生成实现' },
      { name: 'BaseEntity', desc: '实体基类，包含 id, createdAt, updatedAt' },
    ],
  },
  {
    id: 'security-module',
    title: 'Security 模块',
    description: '安全认证与权限管理',
    path: 'nebula-security',
    items: [
      { name: 'OAuth', desc: 'OAuth2 授权服务器实现' },
      { name: 'Token', desc: 'JWT Token 管理' },
      { name: 'Session', desc: '分布式会话管理' },
      { name: 'Permission', desc: '权限模型与校验' },
    ],
  },
  {
    id: 'system-module',
    title: 'System 模块',
    description: '系统管理功能模块',
    path: 'nebula-system',
    items: [
      { name: 'User', desc: '用户管理' },
      { name: 'Role', desc: '角色管理' },
      { name: 'Organization', desc: '组织架构管理' },
      { name: 'SystemConfig', desc: '系统配置管理' },
    ],
  },
];
</script>

<template>
  <div class="backend-page">
    <div class="backend-shell">
      <aside class="backend-sidebar">
        <div class="brand-block">
          <p class="brand-title">Nebula Backend</p>
          <p class="brand-subtitle">后端框架文档</p>
          <NebulaButton
            variant="outline"
            size="small"
            class="brand-back-btn"
            @click="navigateToPage?.('home')"
          >
            ← 返回首页
          </NebulaButton>
        </div>
        <nav class="backend-nav">
          <ul>
            <li><a href="#overview">概览</a></li>
            <li><a href="#core-module">Core 模块</a></li>
            <li><a href="#database-module">Database 模块</a></li>
            <li><a href="#security-module">Security 模块</a></li>
            <li><a href="#system-module">System 模块</a></li>
          </ul>
        </nav>
        <div class="anchor-wrapper">
          <NebulaAnchor
            :items="anchorItems"
            title="On This Page"
            responsive
            back-top
            back-top-mode="float"
          />
        </div>
      </aside>

      <section class="backend-content">
        <section id="overview" class="backend-section">
          <h2>后端文档概览</h2>
          <p>
            后端基于
            <strong>Spring Boot 4.x</strong>
            框架，采用模块化架构设计。核心模块位于
            <code>f:\1-back\nebula</code> 目录。
          </p>
        </section>

        <section
          v-for="mod in modules"
          :key="mod.id"
          :id="mod.id"
          class="backend-section"
        >
          <h3>{{ mod.title }}</h3>
          <p class="backend-module-desc">{{ mod.description }}</p>
          <code class="backend-module-path">{{ mod.path }}</code>

          <div class="backend-api-table">
            <div class="api-table-head">
              <span>组件名称</span>
              <span>说明</span>
            </div>
            <div
              v-for="item in mod.items"
              :key="item.name"
              class="api-table-row"
            >
              <code>{{ item.name }}</code>
              <span>{{ item.desc }}</span>
            </div>
          </div>
        </section>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.backend-page {
  min-height: 100vh;
  padding: 1.5rem 1.75rem;
  overflow-x: auto;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
}

.backend-shell {
  display: grid;
  grid-template-columns: minmax(0, 220px) minmax(0, 1fr);
  gap: clamp(0.75rem, 2vw, 1.5rem);
  min-width: 0;
  max-width: 1200px;
  margin: 0 auto;
}

.backend-sidebar {
  position: sticky;
  top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-self: start;
}

.brand-block {
  padding: 0.95rem 1rem;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
}

.brand-title {
  margin: 0;
  font-size: 1.03rem;
  font-weight: 700;
}

.brand-subtitle {
  margin: 0.35rem 0 0;
  font-size: 0.86rem;
  line-height: 1.45;
  color: hsl(var(--muted-foreground));
}

.brand-back-btn {
  margin-top: 0.75rem;
}

.anchor-wrapper {
  padding: 0.75rem;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
}

.backend-nav {
  padding: 0.75rem;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
}

.backend-nav ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

.backend-nav li {
  margin: 0.35rem 0;
}

.backend-nav a {
  display: block;
  padding: 0.35rem 0.5rem;
  font-size: 0.88rem;
  color: hsl(var(--foreground));
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover {
    background: hsl(var(--accent) / 10%);
  }
}

.backend-content {
  min-width: 0;
}

.backend-section {
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
}

.backend-section h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  line-height: 1.3;
}

.backend-section h3 {
  margin: 0;
  font-size: 1.15rem;
  line-height: 1.3;
}

.backend-section > p {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: hsl(var(--muted-foreground));
}

.backend-module-desc {
  margin: 0.35rem 0 0;
  font-size: 0.88rem;
  color: hsl(var(--muted-foreground));
}

.backend-module-path {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.82rem;
  background: hsl(var(--muted));
  border-radius: 4px;
}

.backend-api-table {
  margin-top: 1rem;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.api-table-head {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 1rem;
  padding: 0.65rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 700;
  background: hsl(var(--accent) / 25%);
  border-bottom: 1px solid hsl(var(--border));
}

.api-table-row {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 1rem;
  padding: 0.6rem 0.85rem;
  border-bottom: 1px solid hsl(var(--border));

  &:last-child {
    border-bottom: none;
  }

  &:nth-child(4n + 1) {
    background: hsl(var(--accent) / 8%);
  }

  code {
    font-size: 0.88rem;
  }

  span {
    font-size: 0.88rem;
    color: hsl(var(--muted-foreground));
  }
}

code {
  font-size: 0.88em;
}

@media (width <= 980px) {
  .backend-page {
    padding: 1rem;
  }

  .backend-shell {
    grid-template-columns: minmax(0, 1fr);
  }

  .backend-sidebar {
    position: static;
  }

  .backend-nav {
    display: none;
  }
}

@media (width <= 520px) {
  .backend-page {
    padding: 0.75rem 0.65rem;
  }

  .brand-block {
    padding: 0.75rem 0.8rem;
  }
}
</style>
