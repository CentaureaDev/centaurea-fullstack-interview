/**
 * AuthProvider - React Context integration for centaurea-ui-auth
 * 
 * Provides authentication state and methods to React components via Context API.
 * Uses centaurea-ui-auth package (authManager, userStore, LocalTokenStorage) under the hood.
 * 
 * Usage:
 * 1. Wrap your app with <AuthProvider apiUrl={apiUrl}>
 * 2. Use useAuth() hook in any component to access: user, token, isAuthenticated, login, register, logout
 * 
 * Features:
 * - Automatic token persistence in localStorage
 * - Reactive state updates via userStore Observable
 * - Auto-initialization from stored token on mount
 * - Type-safe authentication methods
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authManager, userStore, configureAuth, LocalTokenStorage } from 'centaurea-ui-auth';

const AuthContext = createContext(null);

/**
 * Hook to access authentication state and methods
 * 
 * @returns {Object} Authentication context
 * @returns {Object|null} return.user - Current authenticated user
 * @returns {string} return.user.id - User ID
 * @returns {string} return.user.name - User display name
 * @returns {string} return.user.email - User email address
 * @returns {string|null} return.token - Current JWT authentication token
 * @returns {boolean} return.isAuthenticated - Whether user is currently logged in
 * @returns {boolean} return.isLoading - Whether auth state is being initialized
 * @returns {Function} return.register - Register a new user account
 * @returns {Function} return.login - Login with email and password
 * @returns {Function} return.logout - Logout current user and clear session
 * 
 * @throws {Error} If used outside of AuthProvider
 * 
 * @example
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 * 
 *   if (isAuthenticated) {
 *     return (
 *       <div>
 *         <p>Welcome, {user.name}!</p>
 *         <button onClick={logout}>Logout</button>
 *       </div>
 *     );
 *   }
 * 
 *   return <button onClick={() => login('email@example.com', 'password')}>Login</button>;
 * }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * 
 * Wraps centaurea-ui-auth package (authManager, userStore) in React Context.
 * Provides authentication state and methods to all child components via useAuth() hook.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.apiUrl - Base API URL for authentication endpoints (e.g., 'http://localhost:5034/api')
 * 
 * @example
 * // In index.js or App.js
 * import { AuthProvider } from './providers';
 * 
 * const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5034/api';
 * 
 * root.render(
 *   <AuthProvider apiUrl={apiUrl}>
 *     <App />
 *   </AuthProvider>
 * );
 */
export const AuthProvider = ({ children, apiUrl }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configure auth manager on mount
  useEffect(() => {
    const storage = new LocalTokenStorage();
    configureAuth(apiUrl, storage);

    // Initialize user and token from storage
    const initialToken = authManager.getToken();
    const initialUser = authManager.getUser();
    
    setToken(initialToken);
    setUser(initialUser);
    setIsLoading(false);

    // Subscribe to user changes
    const unsubscribe = userStore.subscribe((newUser) => {
      setUser(newUser);
    });

    return () => {
      unsubscribe();
    };
  }, [apiUrl]);


  const register = async (name, email, password) => {
    try {
      const result = await authManager.register(name, email, password);
      setToken(result.token);
      setUser(result.user);
      return result;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const result = await authManager.login(email, password);
      setToken(result.token);
      setUser(result.user);
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authManager.logout();
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
