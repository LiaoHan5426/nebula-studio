<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

export interface NavChild {
  to: string;
  label: string;
}

export interface NavItem {
  key: string;
  label: string;
  icon?: string;
  to?: string;
  children?: NavChild[];
}

const props = defineProps<{
  items: NavItem[];
  modelValue?: Set<string>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Set<string>];
}>();

const route = useRoute();
const searchQuery = ref('');

function isExpanded(key: string) {
  return props.modelValue?.has(key) ?? false;
}

function toggleMenu(key: string) {
  const newValue = new Set(props.modelValue ?? []);
  if (newValue.has(key)) {
    newValue.delete(key);
  } else {
    newValue.add(key);
  }
  emit('update:modelValue', newValue);
}

function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`);
}

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.items;
  }
  const query = searchQuery.value.toLowerCase();
  return props.items
    .map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter((child) =>
          child.label.toLowerCase().includes(query),
        );
        if (
          filteredChildren.length > 0 ||
          item.label.toLowerCase().includes(query)
        ) {
          return { ...item, children: filteredChildren };
        }
        return null;
      }
      return item.label.toLowerCase().includes(query) ? item : null;
    })
    .filter((item): item is NavItem => item !== null);
});

function resetSearch() {
  searchQuery.value = '';
}
</script>

<template>
  <div class="nebula-admin-vertical-nav">
    <div class="nebula-admin-vertical-nav__search">
      <span class="nebula-admin-vertical-nav__search-icon" aria-hidden="true"
        >⌕</span
      >
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索菜单"
        class="nebula-admin-vertical-nav__search-input"
        @keydown.escape="resetSearch"
      />
      <button
        v-if="searchQuery"
        type="button"
        class="nebula-admin-vertical-nav__search-clear"
        @click="resetSearch"
      >
        ×
      </button>
    </div>

    <nav class="nebula-admin-vertical-nav__nav" aria-label="管理导航">
      <template v-for="item in filteredItems" :key="item.key">
        <div v-if="item.children" class="nebula-admin-vertical-nav__group">
          <button
            class="nebula-admin-vertical-nav__group-header"
            :class="{ 'is-expanded': isExpanded(item.key) }"
            @click="toggleMenu(item.key)"
          >
            <span class="nebula-admin-vertical-nav__icon">{{ item.icon }}</span>
            <span class="nebula-admin-vertical-nav__label">{{
              item.label
            }}</span>
            <span class="nebula-admin-vertical-nav__arrow" aria-hidden="true"
              >›</span
            >
          </button>
          <Transition name="nebula-admin-vertical-nav__children">
            <div
              v-show="isExpanded(item.key)"
              class="nebula-admin-vertical-nav__children"
            >
              <RouterLink
                v-for="child in item.children"
                :key="child.to"
                :to="child.to"
                class="nebula-admin-vertical-nav__child"
                :class="{ 'is-active': isActive(child.to) }"
                @click="searchQuery = ''"
              >
                {{ child.label }}
              </RouterLink>
            </div>
          </Transition>
        </div>
        <RouterLink
          v-else
          :to="item.to!"
          class="nebula-admin-vertical-nav__link"
          :class="{ 'is-active': isActive(item.to!) }"
          @click="searchQuery = ''"
        >
          <span class="nebula-admin-vertical-nav__icon">{{
            item.icon ?? ' '
          }}</span>
          <span class="nebula-admin-vertical-nav__label">{{ item.label }}</span>
        </RouterLink>
      </template>

      <div
        v-if="searchQuery && filteredItems.length === 0"
        class="nebula-admin-vertical-nav__empty"
      >
        未找到匹配的菜单
      </div>
    </nav>
  </div>
</template>

<style scoped>
.nebula-admin-vertical-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.nebula-admin-vertical-nav__search {
  position: relative;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-bottom: 1px solid hsl(var(--border) / 40%);
}

.nebula-admin-vertical-nav__search-icon {
  position: absolute;
  left: 16px;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}

.nebula-admin-vertical-nav__search-input {
  width: 100%;
  padding: 7px 12px 7px 32px;
  font-size: 13px;
  color: hsl(var(--foreground));
  outline: none;
  background: hsl(var(--muted) / 40%);
  border: 1px solid hsl(var(--border) / 60%);
  border-radius: 8px;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.nebula-admin-vertical-nav__search-input:focus {
  background: hsl(var(--input-background));
  border-color: hsl(var(--primary) / 50%);
  box-shadow: 0 0 0 3px hsl(var(--primary) / 12%);
}

.nebula-admin-vertical-nav__search-input::placeholder {
  color: hsl(var(--muted-foreground));
}

.nebula-admin-vertical-nav__search-clear {
  position: absolute;
  right: 16px;
  width: 20px;
  height: 20px;
  padding: 0;
  font-size: 14px;
  line-height: 1;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: hsl(var(--background) / 50%);
  border: 1px solid hsl(var(--border) / 60%);
  border-radius: 999px;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.nebula-admin-vertical-nav__search-clear:hover {
  color: hsl(var(--danger));
  background: hsl(var(--danger) / 10%);
}

.nebula-admin-vertical-nav__nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-height: 0;
  padding: 8px;
  overflow-y: auto;
}

.nebula-admin-vertical-nav__link {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 9px 12px;
  font-size: 13px;
  color: hsl(var(--foreground));
  text-decoration: none;
  border-radius: 8px;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.1s ease;
}

.nebula-admin-vertical-nav__link:hover {
  background: hsl(var(--muted) / 60%);
}

.nebula-admin-vertical-nav__link.is-active {
  font-weight: 500;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 12%);
}

.nebula-admin-vertical-nav__group {
  display: flex;
  flex-direction: column;
}

.nebula-admin-vertical-nav__group-header {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--foreground));
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 8px;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.nebula-admin-vertical-nav__group-header:hover {
  background: hsl(var(--muted) / 60%);
}

.nebula-admin-vertical-nav__group-header.is-expanded {
  color: hsl(var(--primary));
}

.nebula-admin-vertical-nav__icon {
  flex-shrink: 0;
  width: 16px;
  font-size: 14px;
  text-align: center;
}

.nebula-admin-vertical-nav__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nebula-admin-vertical-nav__arrow {
  flex-shrink: 0;
  font-size: 10px;
  color: hsl(var(--muted-foreground));
  transition: transform 0.2s ease;
}

.nebula-admin-vertical-nav__group-header.is-expanded
  .nebula-admin-vertical-nav__arrow {
  transform: rotate(90deg);
}

.nebula-admin-vertical-nav__children {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 16px;
  margin-top: 2px;
}

.nebula-admin-vertical-nav__child {
  display: block;
  padding: 7px 12px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  text-decoration: none;
  border-radius: 6px;
  transition:
    all 0.15s ease,
    padding 0.2s ease;
}

.nebula-admin-vertical-nav__child:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--muted) / 60%);
}

.nebula-admin-vertical-nav__child.is-active {
  font-weight: 500;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 10%);
}

.nebula-admin-vertical-nav__empty {
  padding: 20px 12px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.nebula-admin-vertical-nav__children-enter-active,
.nebula-admin-vertical-nav__children-leave-active {
  transition:
    opacity 0.2s ease,
    max-height 0.25s ease,
    padding 0.25s ease;
}

.nebula-admin-vertical-nav__children-enter-from,
.nebula-admin-vertical-nav__children-leave-to {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}

.nebula-admin-vertical-nav__children-enter-to,
.nebula-admin-vertical-nav__children-leave-from {
  max-height: 400px;
  opacity: 1;
}
</style>
