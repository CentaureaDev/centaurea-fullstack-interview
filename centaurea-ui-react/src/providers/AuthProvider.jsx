import { configureAuth } from 'centaurea-ui-shared';
import { createContext, useContext, useMemo } from 'react';
import { useStore } from '../hooks/useStore';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children, apiUrl }) => {
  const manager = useMemo(() => configureAuth(apiUrl), [apiUrl]);
  const state = useStore(manager);

  const value = useMemo(() => ({
    ...state,
    isAuthenticated: !!state.user && !!state.token,
    manager,
    register: manager.register.bind(manager),
    login: manager.login.bind(manager),
    logout: manager.logout.bind(manager),
  }), [state, manager]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
