<script setup lang="ts">
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../ui/card';

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    class?: string;
    contentClass?: string;
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
      <slot />
    </CardContent>
    <CardFooter v-if="$slots.footer">
      <slot name="footer" />
    </CardFooter>
  </Card>
</template>
