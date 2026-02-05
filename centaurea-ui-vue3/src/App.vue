<script>
import { appStore } from './store/appStore';
import { authService } from './services/authService';
import 'centaurea-ui-shared/styles';

export default {
  data() {
    return {
      currentUser: appStore.getUser(),
      unsubscribe: null
    };
  },
  mounted() {
    this.unsubscribe = appStore.subscribe((state) => {
      this.currentUser = state.user;
    });
  },
  unmounted() {
    this.unsubscribe?.();
  },
  methods: {
    handleSignOut() {
      authService.signOut();
      appStore.setUser(null);
      this.$router.push('/auth');
    }
  }
};
</script>

<template>
  <div class="app-container">
    <div class="container">
      <div class="header">
        <h1 class="header__title">Expression Calculator (Vue3)</h1>
        <div v-if="currentUser" class="user-badge">
          <div class="user-badge__info">
            <div class="user-badge__name">{{ currentUser.name }}</div>
            <div class="user-badge__email">{{ currentUser.email }}</div>
          </div>
          <button class="user-badge__button" @click="handleSignOut">Sign out</button>
        </div>
      </div>

      <nav v-if="currentUser" class="tabs">
        <router-link to="/calculator" class="tabs__item" active-class="tabs__item--active">
          Calculator
        </router-link>
        <router-link to="/history" class="tabs__item" active-class="tabs__item--active">
          History
        </router-link>
        <router-link to="/samples" class="tabs__item" active-class="tabs__item--active">
          Samples
        </router-link>
      </nav>

      <router-view />
    </div>
  </div>
</template>
