<template>
  <div class="auth-section">
    <div class="auth-toggle">
      <button
        class="toggle-btn"
        :class="{ active: authMode === 'signin' }"
        @click="authMode = 'signin'"
      >
        Sign in
      </button>
      <button
        class="toggle-btn"
        :class="{ active: authMode === 'register' }"
        @click="authMode = 'register'"
      >
        Register
      </button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">Loading...</div>

    <form v-if="authMode === 'register'" @submit.prevent="handleRegister" class="auth-form">
      <div class="form-group">
        <label>Name</label>
        <input v-model="name" type="text" placeholder="Your name" required />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="you@example.com" required />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" placeholder="Create a password" required />
      </div>
      <button type="submit" class="calculate-btn" :disabled="loading">Register</button>
    </form>

    <form v-else @submit.prevent="handleSignIn" class="auth-form">
      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="you@example.com" required />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" placeholder="Your password" required />
      </div>
      <button type="submit" class="calculate-btn" :disabled="loading">Sign in</button>
    </form>
  </div>
</template>

<script>
import { appStore } from '../store/appStore';
import { authService } from '../services/authService';

export default {
  data() {
    return {
      authMode: 'signin',
      name: '',
      email: '',
      password: '',
      error: null,
      loading: false,
      unsubscribe: null
    };
  },
  mounted() {
    this.unsubscribe = appStore.subscribe((state) => {
      this.error = state.error;
      this.loading = state.loading;
    });
  },
  unmounted() {
    this.unsubscribe?.();
  },
  methods: {
    async handleRegister() {
      appStore.setError(null);
      appStore.setLoading(true);
      try {
        const response = await authService.register(this.name, this.email, this.password);
        authService.setAuth(response.token, response.user);
        appStore.setUser(response.user);
        this.name = '';
        this.email = '';
        this.password = '';
      } catch (err) {
        appStore.setError(err.message || 'Registration failed');
      } finally {
        appStore.setLoading(false);
      }
    },
    async handleSignIn() {
      appStore.setError(null);
      appStore.setLoading(true);
      try {
        const user = await authService.signIn(this.email, this.password);
        appStore.setUser(user);
        this.email = '';
        this.password = '';
      } catch (err) {
        appStore.setError(err.message || 'Sign in failed');
      } finally {
        appStore.setLoading(false);
      }
    }
  }
};
</script>
