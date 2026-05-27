<script setup>
import ErrorBoundary from '@/components/ErrorBoundary.vue';
import NotificationStack from '@/components/NotificationStack.vue';
import UserBadge from '@/components/UserBadge.vue';
import { useAuth } from '@/composables/useAuth';
import { useNotifications } from '@/composables/useNotifications';
import { RouterLink, RouterView } from 'vue-router';

const auth = useAuth();
const notification = useNotifications();

const handleSignOut = () => {
  auth.logout();
};
</script>

<template>
  <div class="app-container">
    <div class="container">
      <div class="header">
        <h1 class="header__title">Expression Calculator (Vue3)</h1>
        <UserBadge v-if="auth.isAuthenticated.value && auth.user.value" :user="auth.user.value" @sign-out="handleSignOut" />
      </div>

      <nav v-if="auth.isAuthenticated.value" class="tabs">
        <RouterLink
          to="/calculator"
          class="tabs__item"
          active-class="tabs__item--active"
          exact-active-class="tabs__item--active"
        >
          Calculator
        </RouterLink>
        <RouterLink to="/history" class="tabs__item" active-class="tabs__item--active">History</RouterLink>
        <RouterLink to="/samples" class="tabs__item" active-class="tabs__item--active">Samples</RouterLink>
      </nav>

      <ErrorBoundary>
        <RouterView />
      </ErrorBoundary>
      <NotificationStack :notifications="notification.notifications.value" @dismiss="notification.dismiss" />
    </div>
  </div>
</template>
