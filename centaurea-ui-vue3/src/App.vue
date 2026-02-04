<script>
import { appStore } from './store/appStore';
import { authService } from './services/authService';

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
  <div id="app">
    <div class="expression-container">
      <div class="header-row">
        <h1>Expression Calculator (Vue3)</h1>
        <div v-if="currentUser" class="user-badge">
          <div>
            <div class="user-name">{{ currentUser.name }}</div>
            <div class="user-email">{{ currentUser.email }}</div>
          </div>
          <button class="signout-btn" @click="handleSignOut">Sign out</button>
        </div>
      </div>

      <nav v-if="currentUser" class="tabs">
        <router-link to="/calculator" class="tab-btn" active-class="active">
          Calculator
        </router-link>
        <router-link to="/history" class="tab-btn" active-class="active">
          History
        </router-link>
        <router-link to="/samples" class="tab-btn" active-class="active">
          Samples
        </router-link>
      </nav>

      <router-view />
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
