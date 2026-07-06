<script setup lang="ts">
import { NebulaTable, NebulaTableColumn } from '@nebula-studio/nebula-ui';

const tableData = [
  { id: 1, name: '张三', age: 28, address: '北京市朝阳区' },
  { id: 2, name: '李四', age: 32, address: '上海市浦东新区' },
  { id: 3, name: '王五', age: 25, address: '广州市天河区' },
  { id: 4, name: '赵六', age: 30, address: '深圳市南山区' },
];
</script>

<template>
  <NebulaTable :data="tableData" :border="true">
    <NebulaTableColumn field="id" title="ID" :width="80" />
    <NebulaTableColumn field="name" title="姓名" />
    <NebulaTableColumn field="age" title="年龄" :width="100" />
    <NebulaTableColumn field="address" title="地址" />
  </NebulaTable>
</template>
