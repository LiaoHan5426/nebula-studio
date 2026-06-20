<script setup lang="ts">
import { NebulaAvatar } from '@nebula-studio/nebula-ui';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
  user?: string;
  email?: string;
  avatarSrc?: string;
}>();

const emit = defineEmits<{
  logout: [];
  lockScreen: [];
  profile: [];
}>();

const open = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const menuStyle = ref<Record<string, string>>({});

const displayEmail = computed(
  () => props.email || `${props.user || 'user'}@nebula.local`,
);

function close() {
  open.value = false;
}

function toggle(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  open.value = !open.value;
}

function updatePosition() {
  const el = triggerRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  menuStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 8}px`,
    right: `${window.innerWidth - rect.right}px`,
    zIndex: '99990',
  };
}

function onDocClick(event: MouseEvent) {
  if (!open.value) return;
  const target = event.target as Node;
  if (triggerRef.value?.contains(target)) return;
  if (menuRef.value?.contains(target)) return;
  close();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close();
}

watch(open, (isOpen) => {
  if (isOpen) {
    updatePosition();
    requestAnimationFrame(updatePosition);
  }
});

onMounted(() => {
  document.addEventListener('click', onDocClick);
  document.addEventListener('keydown', onKeydown);
  window.addEventListener('resize', updatePosition);
  window.addEventListener('scroll', updatePosition, true);
});

onUnmounted(() => {
  document.removeEventListener('click', onDocClick);
  document.removeEventListener('keydown', onKeydown);
  window.removeEventListener('resize', updatePosition);
  window.removeEventListener('scroll', updatePosition, true);
});

function onMenuAction(action: 'profile' | 'lockScreen' | 'logout') {
  if (action === 'profile') emit('profile');
  if (action === 'lockScreen') emit('lockScreen');
  if (action === 'logout') emit('logout');
  close();
}
</script>

<template>
  <div class="nebula-user-menu">
    <button
      ref="triggerRef"
      type="button"
      class="nebula-user-menu__trigger"
      title="账号菜单"
      aria-label="账号菜单"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="toggle"
    >
      <NebulaAvatar
        :src="avatarSrc || ''"
        :text="user || '?'"
        size="sm"
        online
      />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="menuRef"
        class="nebula-dropdown__menu nebula-user-menu__panel"
        :style="menuStyle"
        role="menu"
        @mousedown.stop
      >
        <div class="nebula-user-menu__header">
          <NebulaAvatar
            :src="avatarSrc || ''"
            :text="user || '?'"
            size="lg"
            online
          />
          <div class="nebula-user-menu__meta">
            <p class="nebula-user-menu__name">{{ user || '未登录' }}</p>
            <p class="nebula-user-menu__email">{{ displayEmail }}</p>
          </div>
        </div>

        <div class="nebula-dropdown__divider" role="separator" />
        <button
          type="button"
          class="nebula-dropdown__item"
          role="menuitem"
          @click="onMenuAction('profile')"
        >
          <span class="nebula-dropdown__item-main">个人中心</span>
        </button>
        <button
          type="button"
          class="nebula-dropdown__item"
          role="menuitem"
          @click="close()"
        >
          <span class="nebula-dropdown__item-main">文档</span>
        </button>
        <div class="nebula-dropdown__divider" role="separator" />
        <button
          type="button"
          class="nebula-dropdown__item"
          role="menuitem"
          @click="onMenuAction('lockScreen')"
        >
          <span class="nebula-dropdown__item-main">锁定屏幕</span>
          <span class="nebula-dropdown__item-shortcut">Alt L</span>
        </button>
        <button
          type="button"
          class="nebula-dropdown__item"
          role="menuitem"
          @click="onMenuAction('logout')"
        >
          <span class="nebula-dropdown__item-main">退出登录</span>
          <span class="nebula-dropdown__item-shortcut">Alt Q</span>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.nebula-user-menu {
  display: inline-flex;
}

.nebula-user-menu__trigger {
  display: inline-flex;
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 999px;
  -webkit-app-region: no-drag;
}

.nebula-user-menu__panel {
  min-width: 240px;
}

.nebula-user-menu__header {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 10px 6px;
}

.nebula-user-menu__meta {
  min-width: 0;
}

.nebula-user-menu__name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.nebula-user-menu__email {
  margin: 4px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  white-space: nowrap;
}
</style>
