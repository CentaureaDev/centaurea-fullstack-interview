<script setup>
import { computed } from 'vue';
import { useSamples } from '../composables/expressions/useSamples.js';

const { data: samplesData, isFetching, isError, error, refetch } = useSamples();
const samples = computed(() => samplesData.value ?? []);
</script>

<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">Sample Expressions</h2>
      <div class="grid__buttons">
        <button
          type="button"
          class="button button--primary"
          :disabled="isFetching"
          @click="refetch"
        >
          Refresh
        </button>
      </div>
    </div>

    <div v-if="isError" class="message message--error">{{ error?.message ?? 'Failed to load samples' }}</div>
    <div v-if="isFetching" class="message message--loading">Loading...</div>

    <p v-if="samples.length === 0 && !isFetching" class="message message--empty">
      No sample expressions available
    </p>

    <ul v-else class="list list--items">
      <li v-for="item in samples" :key="item.id" class="card--item">
        <div class="card__expression">{{ item.expressionText }}</div>
        <div class="card__result">{{ item.result }}</div>
        <div class="card__time">{{ new Date(item.computedTime).toLocaleString() }}</div>
      </li>
    </ul>
  </div>
</template>
