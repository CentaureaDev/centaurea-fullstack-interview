// @ts-check
import 'centaurea-ui-shared/styles';
import React from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import CalculatorPage from './pages/CalculatorPage';
import HistoryPage from './pages/HistoryPage';
import SamplesPage from './pages/SamplesPage';
import { useAuth } from './providers/AuthProvider';

/**
 * Main application component
 * Uses AuthProvider for authentication state management
 * @returns {React.ReactElement}
 */
function App() {
  const auth = useAuth();

  /**
   * Handle user logout
   * @returns {void}
   */
  const handleSignOut = () => {
    auth.logout();
  };

  return (
    <div className="app-container">
      <div className="container">
        <div className="header">
          <h1 className="header__title">Expression Calculator (React)</h1>
          {auth.isAuthenticated && auth.user && (
            <div className="user-badge">
              <div className="user-badge__info">
                <div className="user-badge__name">{auth.user.username}</div>
                <div className="user-badge__email">{auth.user.email}</div>
              </div>
              <button className="user-badge__button" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          )}
        </div>

        {auth.isAuthenticated && (
          <nav className="tabs">
            <NavLink
              to="/calculator"
              className={({ isActive }) => `tabs__item${isActive ? ' tabs__item--active' : ''}`}
            >
              Calculator
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) => `tabs__item${isActive ? ' tabs__item--active' : ''}`}
            >
              History
            </NavLink>
            <NavLink
              to="/samples"
              className={({ isActive }) => `tabs__item${isActive ? ' tabs__item--active' : ''}`}
            >
              Samples
            </NavLink>
          </nav>
        )}

        <Routes>
          <Route
            path="/auth"
            element={auth.isAuthenticated ? <Navigate to="/calculator" replace /> : <AuthPage />}
          />
          <Route
            path="/calculator"
            element={auth.isAuthenticated ? <CalculatorPage /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/history"
            element={auth.isAuthenticated ? <HistoryPage /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/samples"
            element={<SamplesPage />}
          />
          <Route
            path="/admin"
            element={<AdminPage />}
          />
          <Route
            path="*"
            element={<Navigate to={auth.isAuthenticated ? '/calculator' : '/auth'} replace />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
