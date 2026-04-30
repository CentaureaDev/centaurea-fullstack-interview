<script setup>
import { computed } from 'vue';
import { useUsers } from '../composables/users/useUsers.js';

const { data: usersData, isLoading, isError, error } = useUsers();
const users = computed(() => usersData.value ?? []);
</script>

<template>
  <div class="section">
    <div v-if="isLoading" class="message message--loading">Loading admin panel...</div>

    <div
      v-else-if="isError"
      class="message message--error u-margin-40-auto u-max-width-sm"
    >
      <h3>Access Denied</h3>
      <p>{{ error?.status === 403 ? 'Access denied. Admin access required.' : (error?.message || 'An error occurred while loading users.') }}</p>
    </div>

    <template v-else>
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
              <td class="table__body-cell">{{ new Date(user.createdAt).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
