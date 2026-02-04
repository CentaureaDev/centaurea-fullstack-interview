<template>
  <div class="history-section">
    <div class="history-header">
      <h2>Calculation History</h2>
      <button
        v-if="history.length > 0"
        @click="handleClearHistory"
        class="clear-btn"
        :disabled="loading"
      >
        Clear History
      </button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">Loading...</div>

    <p v-if="history.length === 0 && !loading" class="empty-message">
      No calculations yet
    </p>

    <ul v-else class="history-list">
      <li v-for="item in history" :key="item.id" class="history-item">
        <div class="history-expression">{{ item.expressionText }}</div>
        <div class="history-result">{{ item.result }}</div>
        <div class="history-time">
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
      history: [],
      loading: false,
      error: null,
      unsubscribe: null
    };
  },
  mounted() {
    this.unsubscribe = appStore.subscribe((state) => {
      this.history = state.history;
      this.loading = state.loading;
      this.error = state.error;
    });
    
    this.fetchHistory();
  },
  unmounted() {
    this.unsubscribe?.();
  },
  methods: {
    async fetchHistory() {
      appStore.setLoading(true);
      appStore.setError(null);
      try {
        const data = await expressionService.getHistory();
        appStore.setHistory(data);
      } catch (err) {
        appStore.setError(err.message || 'Failed to load history');
      } finally {
        appStore.setLoading(false);
      }
    },
    async handleClearHistory() {
      if (!window.confirm('Are you sure you want to clear all history?')) return;

      appStore.setLoading(true);
      appStore.setError(null);
      try {
        await expressionService.clearHistory();
        appStore.setHistory([]);
      } catch (err) {
        appStore.setError(err.message || 'Failed to clear history');
      } finally {
        appStore.setLoading(false);
      }
    }
  }
};
</script>
