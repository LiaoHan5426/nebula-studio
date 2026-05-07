<script setup lang="ts">
import { ref } from 'vue';
import typescriptLogo from './assets/typescript.svg';
import viteLogo from './assets/vite.svg';
import heroImg from './assets/hero.png';

const counter = ref(0);
const setCounter = (value: number) => {
  counter.value = value;
};
</script>
<template>
  <section id="center">
    <div class="hero">
      <img :src="heroImg" class="base" width="170" height="179" />
      <img :src="typescriptLogo" class="framework" alt="TypeScript logo" />
      <img :src="viteLogo" class="vite" alt="Vite logo" />
    </div>
    <div>
      <h1>Get started</h1>
      <p>Edit <code>src/main.ts</code> and save to test <code>HMR</code></p>
    </div>
    <button
      id="counter"
      type="button"
      class="counter"
      @click="setCounter(counter + 1)"
    >
      Count is: {{ counter }}
    </button>
  </section>
</template>
