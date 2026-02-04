<template>
  <div class="expression-container">
    <div v-if="loading" class="loading">Loading admin panel...</div>
    
    <div v-else-if="!isAuthorized" class="error" style="margin: 40px auto; max-width: 500px;">
      <h3>Access Denied</h3>
      <p>{{ error || 'Admin access required. Please log in as admin.' }}</p>
    </div>

    <div v-else>
      <h1>Admin Panel - Users Management</h1>
      
      <div style="margin-bottom: 20px;">
        <p><strong>Total Users:</strong> {{ users.length }}</p>
      </div>

      <div v-if="users.length === 0" class="empty-message">No users found in the system</div>
      
      <div v-else style="overflow-x: auto;">
        <table class="history-table" style="width: 100%;">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ formatDate(user.createdAt) }}</td>
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

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:5034/api';
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
    async loadUsers() {
      this.loading = true;
      this.error = null;
      try {
        this.users = await adminService.getUsers();
        this.isAuthorized = true;
      } catch (err) {
        if (err.message.includes('Failed to fetch') || err.message.includes('403') || err.message.includes('401')) {
          this.error = 'Access denied. Admin access required.';
        } else {
          this.error = err.message;
        }
        this.isAuthorized = false;
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

<style scoped>
.history-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.history-table thead {
  background-color: #f8f9fa;
}

.history-table th,
.history-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.history-table th {
  font-weight: 600;
  color: #333;
}

.history-table tbody tr:hover {
  background-color: #f8f9fa;
}
</style>
