import { useUsers } from '../features';

function AdminPage() {
  const { data: users = [], isLoading, isError, error } = useUsers();

  if (isLoading) {
    return <div className="message message--loading">Loading admin panel...</div>;
  }

  if (isError) {
    // Handle 403 - forbidden (not admin)
    // @ts-ignore - error extends Error with status property
    const errorMessage = error?.status === 403
      ? 'Access denied. Admin access required.'
      : error?.message || 'An error occurred while loading users.';

    return (
      <div className="message message--error u-margin-40-auto u-max-width-sm">
        <h3>Access Denied</h3>
        <p>{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="section">
      <h1 className="section__title">Admin Panel - Users Management</h1>

      <div className="u-margin-bottom-lg">
        <p><strong>Total Users:</strong> {users.length}</p>
      </div>

      {users.length === 0 ? (
        <div className="message message--empty">No users found in the system</div>
      ) : (
        <div className="u-overflow-x-auto">
          <table className="table u-width-full">
            <thead className="table__header">
              <tr>
                <th className="table__header-cell">ID</th>
                <th className="table__header-cell">Name</th>
                <th className="table__header-cell">Email</th>
                <th className="table__header-cell">Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="table__body-row">
                  <td className="table__body-cell">{user.id}</td>
                  <td className="table__body-cell">{user.name}</td>
                  <td className="table__body-cell">{user.email}</td>
                  <td className="table__body-cell">{new Date(user.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
