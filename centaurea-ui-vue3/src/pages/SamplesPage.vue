<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">Sample Expressions</h2>
      <div class="grid__buttons">
        <button
          type="button"
          class="button button--primary"
          :disabled="loading"
          @click="fetchSamples"
        >
          Refresh
        </button>
      </div>
    </div>

    <div v-if="error" class="message message--error">{{ error }}</div>
    <div v-if="loading" class="message message--loading">Loading...</div>

    <p v-if="samples.length === 0 && !loading" class="message message--empty">
      No sample expressions available
    </p>

    <ul v-else class="list list--items">
      <li v-for="item in samples" :key="item.id" class="card--item">
        <div class="card--item__expression">{{ item.expressionText }}</div>
        <div class="card--item__result">{{ item.result }}</div>
        <div class="card--item__time">
          {{ new Date(item.computedTime).toLocaleString() }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { appStore } from '../store/appStore';
import { authService } from '../services/authService';
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
    handleSignOutAndRedirect() {
      authService.signOut();
      appStore.setUser(null);
      appStore.setRedirectMessage('Your session has expired. Please sign in again.');
      this.$router.push('/auth');
    },
    async fetchSamples() {
      appStore.setLoading(true);
      appStore.setError(null);
      try {
        const data = await expressionService.getSamples();
        appStore.setSamples(data);
      } catch (err) {
        if (err.status === 401) {
          this.handleSignOutAndRedirect();
        } else {
          appStore.setError(err.message || 'Failed to load samples');
        }
      } finally {
        appStore.setLoading(false);
      }
    }
  }
};
</script>
