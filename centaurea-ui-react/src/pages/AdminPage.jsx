import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAdminService } from 'centaurea-ui-shared';
import { appStore } from '../store/appStore';
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
      if (err.status === 401) {
        // Token expired or invalid, sign out and redirect
        authService.signOut();
        appStore.setUser(null);
        appStore.setRedirectMessage('Your session has expired. Please sign in again.');
        navigate('/auth');
      } else if (err.status === 403) {
        setError('Access denied. Admin access required.');
        setIsAuthorized(false);
      } else {
        setError(err.message);
        setIsAuthorized(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="message message--loading">Loading admin panel...</div>;
  }

  if (!isAuthorized) {
    return (
      <div className="message message--error u-margin-40-auto u-max-width-sm">
        <h3>Access Denied</h3>
        <p>{error || 'Admin access required. Please log in as admin.'}</p>
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
