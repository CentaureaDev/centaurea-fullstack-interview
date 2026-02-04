import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAdminService } from 'centaurea-ui-shared';
import { authService } from '../services/authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5034/api';
const adminService = createAdminService(API_URL, () => authService.getToken());

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
      setIsAuthorized(true);
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('403') || err.message.includes('401')) {
        setError('Access denied. Admin access required.');
      } else {
        setError(err.message);
      }
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading admin panel...</div>;
  }

  if (!isAuthorized) {
    return (
      <div className="error" style={{ margin: '40px auto', maxWidth: '500px' }}>
        <h3>Access Denied</h3>
        <p>{error || 'Admin access required. Please log in as admin.'}</p>
      </div>
    );
  }

  return (
    <div className="expression-container">
      <h1>Admin Panel - Users Management</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Total Users:</strong> {users.length}</p>
      </div>

      {users.length === 0 ? (
        <div className="empty-message">No users found in the system</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="history-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleString()}</td>
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
