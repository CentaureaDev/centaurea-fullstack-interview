/**
 * authPlugin - Vue Plugin integration for centaurea-ui-auth
 *
 * Provides authentication state and methods to Vue components via provide/inject.
 * Uses centaurea-ui-auth package (configureAuth) under the hood.
 *
 * Usage:
 * 1. Install the plugin in main.js: app.use(createAuthPlugin(apiUrl))
 * 2. Use useAuth() composable in any component to access:
 *    user, token, isAuthenticated, isLoading, login, register, logout
 *
 * Features:
 * - Automatic token persistence in localStorage
 * - Reactive state updates via onUserChange callback
 * - Auto-initialization from stored token on mount
 */

import { configureAuth } from 'centaurea-ui-auth';
import { computed, inject, reactive, toRef } from 'vue';

const AUTH_KEY = Symbol('auth');

/**
 * Module-level auth reference for use outside components (e.g. router, apiPlugin).
 * @type {ReturnType<typeof createAuthContext> | null}
 */
let _authInstance = null;

/**
 * Get the current auth token (for use outside Vue components)
 * @returns {string | null}
 */
export function getAuthToken() {
  return _authInstance?.token ?? null;
}

/**
 * Trigger logout from outside Vue components (e.g. on 401 from API plugin)
 * @returns {void}
 */
export function triggerAuthLogout() {
  _authInstance?.logout();
}

/**
 * Create auth context object backed by reactive state.
 * @param {ReturnType<typeof configureAuth>} authManager
 * @returns reactive auth context
 */
function createAuthContext(authManager) {
  const state = reactive({
    user: null,
    token: null,
    isLoading: true,
  });

  authManager.onUserChange = (updatedUser, updatedToken) => {
    state.user = updatedUser;
    state.token = updatedToken;
    state.isLoading = false;
  };

  // Hydrate from storage on startup
  const initialUser = authManager.getUser();
  const initialToken = authManager.getToken();
  if (initialUser && initialToken) {
    state.user = initialUser;
    state.token = initialToken;
  }
  state.isLoading = false;

  const auth = reactive({
    user: toRef(state, 'user'),
    token: toRef(state, 'token'),
    isLoading: toRef(state, 'isLoading'),
    isAuthenticated: computed(() => !!state.user && !!state.token),

    /**
     * Register a new user account
     * @param {string} name
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{token: string, user: object}>}
     */
    register: async (name, email, password) => {
      const result = await authManager.register(name, email, password);
      if (!result) throw new Error('Registration failed');
      return result;
    },

    /**
     * Login with email and password
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{token: string, user: object}>}
     */
    login: async (email, password) => {
      const result = await authManager.login(email, password);
      if (!result) throw new Error('Login failed');
      return result;
    },

    /**
     * Logout current user and clear session
     * @returns {void}
     */
    logout: () => {
      authManager.logout();
    },
  });

  return auth;
}

/**
 * Create the Vue auth plugin
 * @param {string} apiUrl - Base API URL for authentication endpoints
 * @returns {import('vue').Plugin}
 */
export function createAuthPlugin(apiUrl) {
  return {
    install(app) {
      const authManager = configureAuth(apiUrl);
      const auth = createAuthContext(authManager);
      _authInstance = auth;
      app.provide(AUTH_KEY, auth);
    },
  };
}

/**
 * Composable to access authentication state and methods.
 * Must be used inside a component or composable within the app.
 * @returns reactive auth context with user, token, isAuthenticated, isLoading, login, register, logout
 */
export function useAuth() {
  const auth = inject(AUTH_KEY);
  if (!auth) throw new Error('useAuth must be used within an app that has authPlugin installed');
  return auth;
}
