<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../plugins/authPlugin.js';

const auth = useAuth();
const router = useRouter();

const authMode = ref('signin');
const name = ref('');
const email = ref('');
const password = ref('');
const error = ref(null);

watch(
  () => auth.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      router.replace('/calculator');
    }
  },
);

const handleRegister = async (e) => {
  e.preventDefault();
  error.value = null;
  try {
    await auth.register(name.value, email.value, password.value);
    name.value = '';
    email.value = '';
    password.value = '';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Registration failed';
  }
};

const handleSignIn = async (e) => {
  e.preventDefault();
  error.value = null;
  try {
    await auth.login(email.value, password.value);
    email.value = '';
    password.value = '';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Sign in failed';
  }
};
</script>

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

    <div v-if="error" class="message message--error">{{ error }}</div>
    <div v-if="auth.isLoading" class="message message--loading">Loading...</div>

    <form v-if="authMode === 'register'" @submit="handleRegister" class="form form--auth">
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
      <button type="submit" class="button button--primary" :disabled="auth.isLoading">Register</button>
    </form>

    <form v-else @submit="handleSignIn" class="form form--auth">
      <div class="form__group">
        <label class="form__label">Email</label>
        <input v-model="email" class="form__input" type="email" placeholder="you@example.com" required />
      </div>
      <div class="form__group">
        <label class="form__label">Password</label>
        <input v-model="password" class="form__input" type="password" placeholder="Your password" required />
      </div>
      <button type="submit" class="button button--primary" :disabled="auth.isLoading">Sign in</button>
    </form>
  </div>
</template>

