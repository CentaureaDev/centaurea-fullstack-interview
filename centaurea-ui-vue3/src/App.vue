<script setup>
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from './plugins/authPlugin.js';

const auth = useAuth();
const router = useRouter();

watch(
  () => auth.isAuthenticated,
  (isAuthenticated) => {
    if (!isAuthenticated) router.push('/auth');
  },
);

const handleSignOut = () => {
  auth.logout();
};
</script>

<template>
  <div class="app-container">
    <div class="container">
      <div class="header">
        <h1 class="header__title">Expression Calculator (Vue3)</h1>
        <div v-if="auth.isAuthenticated" class="user-badge">
          <div class="user-badge__info">
            <div class="user-badge__name">{{ auth.user?.username }}</div>
            <div class="user-badge__email">{{ auth.user?.email }}</div>
          </div>
          <button class="user-badge__button" @click="handleSignOut">Sign out</button>
        </div>
      </div>

      <nav v-if="auth.isAuthenticated" class="tabs">
        <router-link to="/calculator" class="tabs__item" active-class="tabs__item--active">Calculator</router-link>
        <router-link to="/history" class="tabs__item" active-class="tabs__item--active">History</router-link>
        <router-link to="/samples" class="tabs__item" active-class="tabs__item--active">Samples</router-link>
      </nav>

      <router-view />
    </div>
  </div>
</template>
