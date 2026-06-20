<script setup lang="ts">
import { NebulaSwitch } from '@nebula-studio/nebula-ui';

import { useLayoutPreferences } from '../../composables/useLayoutPreferences';

const { preferences } = useLayoutPreferences();

function setPinned(next: boolean) {
  preferences.pinned = next;
  preferences.collapsed = !next;
}
</script>

<template>
  <section class="layout-tab">
    <div class="layout-tab__row">
      <div>
        <p class="layout-tab__label">默认折叠侧栏</p>
        <p class="layout-tab__hint">启动时侧栏处于收起状态</p>
      </div>
      <NebulaSwitch
        :model-value="preferences.collapsed"
        @update:model-value="preferences.collapsed = $event"
      />
    </div>

    <div class="layout-tab__row">
      <div>
        <p class="layout-tab__label">固定侧栏</p>
        <p class="layout-tab__hint">开启后侧栏展开并锁定；关闭后收起到图标栏</p>
      </div>
      <NebulaSwitch
        :model-value="preferences.pinned"
        @update:model-value="setPinned($event)"
      />
    </div>

    <div class="layout-tab__row">
      <div>
        <p class="layout-tab__label">悬浮展开</p>
        <p class="layout-tab__hint">未固定时鼠标移入临时展开</p>
      </div>
      <NebulaSwitch
        :model-value="preferences.expandOnHover"
        @update:model-value="preferences.expandOnHover = $event"
      />
    </div>

    <div class="layout-tab__row">
      <div>
        <p class="layout-tab__label">显示标签栏</p>
      </div>
      <NebulaSwitch
        :model-value="preferences.showTagsBar"
        @update:model-value="preferences.showTagsBar = $event"
      />
    </div>

    <div class="layout-tab__row">
      <div>
        <p class="layout-tab__label">显示面包屑</p>
      </div>
      <NebulaSwitch
        :model-value="preferences.showBreadcrumb"
        @update:model-value="preferences.showBreadcrumb = $event"
      />
    </div>

    <div class="layout-tab__row">
      <div>
        <p class="layout-tab__label">紧凑内容区</p>
      </div>
      <NebulaSwitch
        :model-value="preferences.contentCompact"
        @update:model-value="preferences.contentCompact = $event"
      />
    </div>
  </section>
</template>

<style scoped>
.layout-tab {
  display: grid;
  gap: 14px;
}

.layout-tab__row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.layout-tab__label {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
}

.layout-tab__hint {
  margin: 4px 0 0;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}
</style>
