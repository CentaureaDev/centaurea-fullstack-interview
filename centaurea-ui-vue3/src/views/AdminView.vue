<script setup>
import AsyncContent from '@/components/AsyncContent.vue';
import DataTable from '@/components/DataTable.vue';
import PageSection from '@/components/PageSection.vue';
import PageSectionHeader from '@/components/PageSectionHeader.vue';
import { useUserList } from '@/composables/useApi';
import { getCoreRowModel, useVueTable } from '@tanstack/vue-table';
import { formatDate } from 'centaurea-ui-shared';
import { computed } from 'vue';

const usersQuery = useUserList();
const users = computed(() => usersQuery.data.value ?? []);

const table = useVueTable({
  get data() {
    return users.value;
  },
  columns: [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    {
      header: 'Created At',
      accessorKey: 'createdAt',
      cell: (info) => formatDate(info.getValue()),
    },
  ],
  getCoreRowModel: getCoreRowModel(),
});
</script>

<template>
  <PageSection>
    <PageSectionHeader title="Admin Panel - Users Management" />

    <AsyncContent
      :is-loading="usersQuery.isLoading.value"
      :is-error="usersQuery.isError.value"
      :error="usersQuery.error.value"
      :is-empty="!usersQuery.isLoading.value && !usersQuery.isError.value && users.length === 0"
      loading-message="Loading admin panel..."
      empty-message="No users found in the system"
    >
      <div class="u-margin-bottom-lg">
        <p><strong>Total Users:</strong> {{ users.length }}</p>
      </div>

      <DataTable :table="table" />
    </AsyncContent>
  </PageSection>
</template>
