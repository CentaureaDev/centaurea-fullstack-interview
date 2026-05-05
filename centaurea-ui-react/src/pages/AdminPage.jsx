import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';
import AsyncContent from '../components/AsyncContent';
import Section from '../components/Section';
import SectionHeader from '../components/SectionHeader';
import Table from '../components/Table';
import { useApi } from '../providers';

const columns = [
  { header: 'ID', accessorKey: 'id' },
  { header: 'Name', accessorKey: 'name' },
  { header: 'Email', accessorKey: 'email' },
  {
    header: 'Created At',
    accessorKey: 'createdAt',
    cell: (info) => new Date(info.getValue()).toLocaleString(),
  },
];

function AdminPage() {
  const { getUsers: { data: users = [], isLoading, isError, error } } = useApi();

  const errorMessage = useMemo(() => {
    if (!isError) return null;
    // @ts-ignore — error.status is added by the API client middleware
    return error?.status === 403
      ? 'Access denied. Admin access required.'
      : error?.message || 'An error occurred while loading users.';
  }, [isError, error]);

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Section>
      <SectionHeader title="Admin Panel - Users Management" />

      <AsyncContent
        isLoading={isLoading}
        isError={isError}
        error={{ message: errorMessage }}
        loadingMessage="Loading admin panel..."
        isEmpty={!isLoading && !isError && users.length === 0}
        emptyMessage="No users found in the system"
      >
        <div className="u-margin-bottom-lg">
          <p><strong>Total Users:</strong> {users.length}</p>
        </div>
        <Table table={table} />
      </AsyncContent>
    </Section>
  );
}


export default AdminPage;
