<template>
  <div class="section">
    <div class="toggle">
      <button
        class="toggle__button"
        :class="{ 'toggle__button--active': authMode === 'signin' }"
        @click="authMode = 'signin'"
      >
        Sign in
      </button>
      <button
        class="toggle__button"
        :class="{ 'toggle__button--active': authMode === 'register' }"
        @click="authMode = 'register'"
      >
        Register
      </button>
    </div>

    <div v-if="redirectMessage" class="message message--info">{{ redirectMessage }}</div>

    <div v-if="error" class="message message--error">{{ error }}</div>
    <div v-if="loading" class="message message--loading">Loading...</div>

    <form v-if="authMode === 'register'" @submit.prevent="handleRegister" class="form form--auth">
      <div class="form__group">
        <label class="form__label">Name</label>
        <input v-model="name" class="form__input" type="text" placeholder="Your name" required />
      </div>
      <div class="form__group">
        <label class="form__label">Email</label>
        <input v-model="email" class="form__input" type="email" placeholder="you@example.com" required />
      </div>
      <div class="form__group">
        <label class="form__label">Password</label>
        <input v-model="password" class="form__input" type="password" placeholder="Create a password" required />
      </div>
      <button type="submit" class="button button--primary" :disabled="loading">Register</button>
    </form>

    <form v-else @submit.prevent="handleSignIn" class="form form--auth">
      <div class="form__group">
        <label class="form__label">Email</label>
        <input v-model="email" class="form__input" type="email" placeholder="you@example.com" required />
      </div>
      <div class="form__group">
        <label class="form__label">Password</label>
        <input v-model="password" class="form__input" type="password" placeholder="Your password" required />
      </div>
      <button type="submit" class="button button--primary" :disabled="loading">Sign in</button>
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
      redirectMessage: null,
      loading: false,
      unsubscribe: null,
      clearMessageTimer: null
    };
  },
  mounted() {
    this.unsubscribe = appStore.subscribe((state) => {
      this.error = state.error;
      this.redirectMessage = state.redirectMessage;
      this.loading = state.loading;
    });
  },
  unmounted() {
    this.unsubscribe?.();
    if (this.clearMessageTimer) {
      clearTimeout(this.clearMessageTimer);
    }
  },
  watch: {
    redirectMessage(newValue) {
      if (newValue) {
        if (this.clearMessageTimer) {
          clearTimeout(this.clearMessageTimer);
        }
        this.clearMessageTimer = setTimeout(() => {
          appStore.clearRedirectMessage();
        }, 5000);
      }
    }
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
        this.$router.push('/calculator');
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
        this.$router.push('/calculator');
      } catch (err) {
        appStore.setError(err.message || 'Sign in failed');
      } finally {
        appStore.setLoading(false);
      }
    }
  }
};
</script>
