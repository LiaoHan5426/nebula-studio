<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';

const props = withDefaults(
  defineProps<{
    class?: string;
    contentClass?: string;
    description?: string;
    title?: string;
  }>(),
  {
    title: '',
    description: '',
    class: '',
    contentClass: '',
  },
);
</script>

<template>
  <Card :class="props.class">
    <CardHeader v-if="title || description">
      <CardTitle v-if="title">{{ title }}</CardTitle>
      <CardDescription v-if="description">{{ description }}</CardDescription>
    </CardHeader>
    <CardContent :class="props.contentClass">
      <slot></slot>
    </CardContent>
    <CardFooter v-if="$slots.footer">
      <slot name="footer"></slot>
    </CardFooter>
  </Card>
</template>
