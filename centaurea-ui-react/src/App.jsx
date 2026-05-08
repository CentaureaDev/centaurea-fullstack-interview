import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import UserBadge from './components/UserBadge';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import CalculatorPage from './pages/CalculatorPage';
import HistoryPage from './pages/HistoryPage';
import SamplesPage from './pages/SamplesPage';
import { useAuth } from './providers/AuthProvider';

function App() {
  const auth = useAuth();

  const handleSignOut = () => {
    auth.logout();
  };

  return (
    <div className="app-container">
      <div className="container">
        <div className="header">
          <h1 className="header__title">Expression Calculator (React)</h1>
          {auth.isAuthenticated && auth.user && (
            <UserBadge user={auth.user} onSignOut={handleSignOut} />
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

        <ErrorBoundary>
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
              element={auth.isAuthenticated ? <SamplesPage /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/admin"
              element={auth.isAuthenticated ? <AdminPage /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="*"
              element={<Navigate to={auth.isAuthenticated ? '/calculator' : '/auth'} replace />}
            />
          </Routes>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
