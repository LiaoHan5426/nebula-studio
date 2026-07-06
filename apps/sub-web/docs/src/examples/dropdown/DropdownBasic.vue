<script setup lang="ts">
import { ref } from 'vue';
import {
  NebulaDropdown,
  NebulaDropdownItem,
  NebulaButton,
} from '@nebula-studio/nebula-ui';

const dropdownOpen = ref(false);
</script>

<template>
  <NebulaDropdown v-model:open="dropdownOpen">
    <template #trigger>
      <NebulaButton>下拉菜单 ▾</NebulaButton>
    </template>
    <NebulaDropdownItem>选项一</NebulaDropdownItem>
    <NebulaDropdownItem>选项二</NebulaDropdownItem>
    <NebulaDropdownItem>选项三</NebulaDropdownItem>
  </NebulaDropdown>
</template>
