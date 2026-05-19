import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { formatDate } from 'centaurea-ui-shared';
import AsyncContent from '../components/AsyncContent';
import Section from '../components/Section';
import SectionHeader from '../components/SectionHeader';
import Table from '../components/Table';
import { useUsers } from '../providers';

const columns = [
  { header: 'ID', accessorKey: 'id' },
  { header: 'Name', accessorKey: 'name' },
  { header: 'Email', accessorKey: 'email' },
  {
    header: 'Created At',
    accessorKey: 'createdAt',
    cell: (info) => formatDate(info.getValue()),
  },
];

function AdminPage() {
  const { data: users = [], isLoading, isError, error } = useUsers();

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
        error={error}
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
