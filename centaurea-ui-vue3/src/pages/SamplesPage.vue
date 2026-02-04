<template>
  <div class="samples-section">
    <h2>Sample Expressions</h2>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">Loading...</div>

    <p v-if="samples.length === 0 && !loading" class="empty-message">
      No sample expressions available
    </p>

    <ul v-else class="samples-list">
      <li v-for="item in samples" :key="item.id" class="sample-item">
        <div class="sample-expression">{{ item.expressionText }}</div>
        <div class="sample-result">{{ item.result }}</div>
        <div class="sample-time">
          {{ new Date(item.computedTime).toLocaleString() }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { appStore } from '../store/appStore';
import { expressionService } from '../services/expressionService';

export default {
  data() {
    return {
      samples: [],
      loading: false,
      error: null,
      unsubscribe: null
    };
  },
  mounted() {
    this.unsubscribe = appStore.subscribe((state) => {
      this.samples = state.samples;
      this.loading = state.loading;
      this.error = state.error;
    });
    
    this.fetchSamples();
  },
  unmounted() {
    this.unsubscribe?.();
  },
  methods: {
    async fetchSamples() {
      appStore.setLoading(true);
      appStore.setError(null);
      try {
        const data = await expressionService.getSamples();
        appStore.setSamples(data);
      } catch (err) {
        appStore.setError(err.message || 'Failed to load samples');
      } finally {
        appStore.setLoading(false);
      }
    }
  }
};
</script>
