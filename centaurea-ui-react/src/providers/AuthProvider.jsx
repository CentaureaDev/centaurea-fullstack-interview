// @ts-check
/*
 * AuthProvider - React Context integration for centaurea-ui-auth
 * 
 * Provides authentication state and methods to React components via Context API.
 * Uses centaurea-ui-auth package (authManager, userStore) under the hood.
 * 
 * Usage:
 * 1. Wrap your app with <AuthProvider apiUrl={apiUrl}>
 * 2. Use useAuth() hook in any component to access: user, token, isAuthenticated, login, register, logout
 * 
 * Features:
 * - Automatic token persistence in localStorage
 * - Reactive state updates via auth manager
 * - Auto-initialization from stored token on mount
 * - Type-safe authentication methods
 */

import { configureAuth } from 'centaurea-ui-auth';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} email
 * @property {boolean} isAdmin
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {User|null} user - Current authenticated user
 * @property {string|null} token - Current JWT authentication token
 * @property {boolean} isAuthenticated - Whether user is currently logged in
 * @property {boolean} isLoading - Whether auth state is being initialized
 * @property {(name: string, email: string, password: string) => Promise<{token: string, user: User}>} register - Register a new user account
 * @property {(email: string, password: string) => Promise<{token: string, user: User}>} login - Login with email and password
 * @property {() => void} logout - Logout current user and clear session
 */

/** @type {React.Context<AuthContextValue|null>} */
const AuthContext = createContext(/** @type {AuthContextValue|null} */(null));

/**
 * Hook to access authentication state and methods
 * 
 * @returns {AuthContextValue} Authentication context
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
  /** @type {AuthContextValue|null} */
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
 * @returns {React.ReactElement}
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
  /** @type {[User|null, Function]} */
  const [user, setUser] = useState(null);
  /** @type {[string|null, Function]} */
  const [token, setToken] = useState(null);
  /** @type {[boolean, Function]} */
  const [isLoading, setIsLoading] = useState(true);

  /** @type {any} */
  const authManagerRef = useRef(null);

  // Configure auth manager on mount with user change callback
  useEffect(() => {
    // Configure auth manager
    authManagerRef.current = configureAuth(apiUrl);
    
    // Set user change callback
    authManagerRef.current.onUserChange = (updatedUser, updatedToken) => {
      setUser(updatedUser);
      setToken(updatedToken);
      setIsLoading(false);
    };
    
    // Trigger initial state from storage
    const initialUser = authManagerRef.current.getUser();
    const initialToken = authManagerRef.current.getToken();
    if (initialUser && initialToken) {
      setUser(initialUser);
      setToken(initialToken);
    }
    setIsLoading(false);

    return () => {
      // Cleanup callback
      if (authManagerRef.current) {
        authManagerRef.current.onUserChange = undefined;
      }
    };
  }, [apiUrl]);

  /**
   * Register new user
   * @param {string} name - User's full name
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<{token: string, user: User}>}
   * @throws {Error} If registration fails
   */
  const register = async (name, email, password) => {
    try {
      const result = await authManagerRef.current?.register(name, email, password);
      if (!result) throw new Error('Registration failed');
      // State updated via onUserChange callback
      return result;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Login user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<{token: string, user: User}>}
   * @throws {Error} If login fails
   */
  const login = async (email, password) => {
    try {
      const result = await authManagerRef.current?.login(email, password);
      if (!result) throw new Error('Login failed');
      // State updated via onUserChange callback
      return result;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout current user
   * Clears token and user from storage and state
   * @returns {void}
   */
  const logout = () => {
    // Logout will trigger onUserChange(null, null) callback
    authManagerRef.current?.logout();
  };

  /** @type {AuthContextValue} */
  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};