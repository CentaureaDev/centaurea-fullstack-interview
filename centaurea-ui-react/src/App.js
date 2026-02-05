import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import 'centaurea-ui-shared/styles';
import { appStore } from './store/appStore';
import AuthPage from './pages/AuthPage';
import CalculatorPage from './pages/CalculatorPage';
import HistoryPage from './pages/HistoryPage';
import SamplesPage from './pages/SamplesPage';
import AdminPage from './pages/AdminPage';
import { authService } from './services/authService';

function App() {
  const [currentUser, setCurrentUser] = useState(appStore.getUser());

  useEffect(() => {
    const handleStateChange = (state) => {
      setCurrentUser(state.user);
    };
    const unsubscribe = appStore.subscribe(handleStateChange);
    return unsubscribe;
  }, []);

  const handleSignOut = () => {
    authService.signOut();
    appStore.setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="container">
          <div className="header">
            <h1 className="header__title">Expression Calculator (React)</h1>
            {currentUser && (
              <div className="user-badge">
                <div className="user-badge__info">
                  <div className="user-badge__name">{currentUser.name}</div>
                  <div className="user-badge__email">{currentUser.email}</div>
                </div>
                <button className="user-badge__button" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            )}
          </div>

          {currentUser && (
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
              element={currentUser ? <Navigate to="/calculator" replace /> : <AuthPage />}
            />
            <Route
              path="/calculator"
              element={currentUser ? <CalculatorPage /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/history"
              element={currentUser ? <HistoryPage /> : <Navigate to="/auth" replace />}
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
              element={<Navigate to={currentUser ? '/calculator' : '/auth'} replace />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
