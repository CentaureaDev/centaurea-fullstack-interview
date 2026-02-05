<template>
  <div class="section">
    <div v-if="loading" class="message message--loading">Loading admin panel...</div>
    
    <div v-else-if="!isAuthorized" class="message message--error u-margin-40-auto u-max-width-sm">
      <h3>Access Denied</h3>
      <p>{{ error || 'Admin access required. Please log in as admin.' }}</p>
    </div>

    <div v-else>
      <h1 class="section__title">Admin Panel - Users Management</h1>
      
      <div class="u-margin-bottom-lg">
        <p><strong>Total Users:</strong> {{ users.length }}</p>
      </div>

      <div v-if="users.length === 0" class="message message--empty">No users found in the system</div>
      
      <div v-else class="u-overflow-x-auto">
        <table class="table u-width-full">
          <thead class="table__header">
            <tr>
              <th class="table__header-cell">ID</th>
              <th class="table__header-cell">Name</th>
              <th class="table__header-cell">Email</th>
              <th class="table__header-cell">Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="table__body-row">
              <td class="table__body-cell">{{ user.id }}</td>
              <td class="table__body-cell">{{ user.name }}</td>
              <td class="table__body-cell">{{ user.email }}</td>
              <td class="table__body-cell">{{ formatDate(user.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { createAdminService } from 'centaurea-ui-shared';
import { authService } from '../services/authService';
import { appStore } from '../store/appStore';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5034/api';
const adminService = createAdminService(API_URL, () => authService.getToken());

export default {
  data() {
    return {
      users: [],
      loading: true,
      error: null,
      isAuthorized: false,
    };
  },
  mounted() {
    this.loadUsers();
  },
  methods: {
    handleSignOutAndRedirect() {
      authService.signOut();
      appStore.setUser(null);
      appStore.setRedirectMessage('Your session has expired. Please sign in again.');
      this.$router.push('/auth');
    },
    async loadUsers() {
      this.loading = true;
      this.error = null;
      try {
        this.users = await adminService.getUsers();
        this.isAuthorized = true;
      } catch (err) {
        if (err.status === 401) {
          this.handleSignOutAndRedirect();
        } else if (err.status === 403) {
          this.error = 'Access denied. Admin access required.';
          this.isAuthorized = false;
        } else {
          this.error = err.message;
          this.isAuthorized = false;
        }
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    },
  },
};
</script>
