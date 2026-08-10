<script setup lang="ts">
import {
  NebulaButton,
  NebulaDropdown,
  NebulaDropdownDivider,
  NebulaDropdownItem,
} from '@nebula-studio/nebula-ui';
</script>

<template>
  <NebulaDropdown placement="bottom-start">
    <template #trigger>
      <NebulaButton variant="primary">操作菜单 ▾</NebulaButton>
    </template>
    <NebulaDropdownItem>编辑</NebulaDropdownItem>
    <NebulaDropdownItem>复制</NebulaDropdownItem>
    <NebulaDropdownDivider />
    <NebulaDropdownItem disabled>删除</NebulaDropdownItem>
  </NebulaDropdown>
</template>
