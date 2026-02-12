// @ts-check
/**
 * ApiProvider - React Context integration for centaurea-ui-api
 * 
 * Provides API client, TanStack Query operations, and QueryClient to React components.
 * Works in conjunction with AuthProvider to handle authenticated API requests.
 * 
 * Usage:
 * 1. Wrap your app with <ApiProvider> inside <AuthProvider>
 * 2. Use useApi() hook in any component to access: api, operations, queryClient
 * 
 * Features:
 * - TanStack Query integration with configured QueryClient
 * - Automatic token management via getToken callback
 * - Auto-logout on 401 (unauthorized) responses
 * - Centralized API operations for expressions and users
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiClient, createExpressionApi, createOperations, createUserApi } from 'centaurea-ui-api';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

/** @type {React.Context<{api: any, operations: any, queryClient: import('@tanstack/react-query').QueryClient}|null>} */
const ApiContext = createContext(/** @type {any} */(null));

/**
 * @typedef {Object} ExpressionOperations
 * @property {function(number=): Object} history - Get expression history query config (default limit: 100)
 * @property {function(): Object} samples - Get sample expressions query config
 * @property {function(): Object} calculate - Calculate expression mutation config
 *   - Params: { operation, firstOperand, secondOperand, pattern?, text? }
 * @property {function(): Object} clearHistory - Clear expression history mutation config
 * @property {function(): Object} updateComputedTime - Update computed time mutation config
 *   - Params: { id, computedTime }
 * @property {Object} keys - Expression query keys for manual cache management
 */

/**
 * @typedef {Object} UserOperations
 * @property {function(): Object} list - Get all users query config (admin only)
 * @property {Object} keys - User query keys for manual cache management
 */

/**
 * @typedef {Object} ApiOperations
 * @property {ExpressionOperations} expressions - Expression-related queries and mutations
 * @property {UserOperations} users - User-related queries
 */

/**
 * @typedef {Object} ApiContextValue
 * @property {Object} api - Raw API client instance
 * @property {Object} api.client - HTTP client
 * @property {Object} api.expression - Expression API methods
 * @property {Object} api.user - User API methods
 * @property {ApiOperations} operations - TanStack Query operation configs
 * @property {QueryClient} queryClient - TanStack Query client instance
 */

/**
 * Hook to access API operations and query client
 * 
 * @returns {ApiContextValue} API context with operations and client
 * 
 * @throws {Error} If used outside of ApiProvider
 * 
 * @example
 * // Using with TanStack Query hooks
 * function MyComponent() {
 *   const { operations } = useApi();
 *   
 *   // Queries
 *   const { data: history } = useQuery(operations.expressions.history(50));
 *   const { data: samples } = useQuery(operations.expressions.samples());
 *   const { data: users } = useQuery(operations.users.list());
 *   
 *   // Mutations
 *   const { mutate: calculate } = useMutation(operations.expressions.calculate());
 *   const { mutate: clearHistory } = useMutation(operations.expressions.clearHistory());
 *   const { mutate: updateTime } = useMutation(operations.expressions.updateComputedTime());
 *   
 *   // Using mutations
 *   calculate({ operation: 0, firstOperand: 5, secondOperand: 3 });
 *   clearHistory();
 *   updateTime({ id: 123, computedTime: '2026-02-11T10:00:00Z' });
 * }
 */
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return context;
};

/**
 * API Provider Component
 * 
 * Wraps centaurea-ui-api package in React Context.
 * Provides API client and TanStack Query operations to all child components.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.apiUrl - Base API URL (e.g., 'http://localhost:5034/api')
 * @param {function(): string|null} props.getToken - Function to retrieve auth token
 * @param {function(): void} props.onUnauthorized - Callback when request returns 401
 * @param {function(): void} props.onForbidden - Callback when request returns 403
 * 
 * @example
 * // In index.js or App.js
 * import { AuthProvider, ApiProvider } from './providers';
 * import { authManager } from 'centaurea-ui-auth';
 * 
 * const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5034/api';
 * 
 * function AppProviders({ children }) {
 *   const { logout } = useAuth();
 * 
 *   return (
 *     <ApiProvider 
 *       apiUrl={apiUrl}
 *       getToken={() => authManager.getToken()}
 *       onUnauthorized={logout}
 *       onForbidden={() => console.warn('Access forbidden')}
 *     >
 *       {children}
 *     </ApiProvider>
 *   );
 * }
 * 
 * root.render(
 *   <AuthProvider apiUrl={apiUrl}>
 *     <AppProviders>
 *       <App />
 *     </AppProviders>
 *   </AuthProvider>
 * );
 */
/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.apiUrl
 * @param {() => string|null} props.getToken
 * @param {() => void} props.onUnauthorized
 * @param {() => void} props.onForbidden
 */
export const ApiProvider = ({ children, apiUrl, getToken, onUnauthorized, onForbidden }) => {
  const [isReady, setIsReady] = useState(false);

  // Create QueryClient instance
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }), []);

  // Create API client and apis
  const { apiClient, expressionApi, userApi } = useMemo(() => {
    const client = new ApiClient(apiUrl, getToken, onUnauthorized, onForbidden);
    return {
      apiClient: client,
      expressionApi: createExpressionApi(client),
      userApi: createUserApi(client)
    };
  }, [apiUrl, getToken, onUnauthorized, onForbidden]);

  // Create operations with query client
  const operations = useMemo(() => {
    const api = {
      client: apiClient,
      expression: expressionApi,
      user: userApi
    };
    return createOperations(api, queryClient);
  }, [apiClient, expressionApi, userApi, queryClient]);

  // Mark as ready after initial setup
  useEffect(() => {
    setIsReady(true);
  }, []);

  const value = {
    api: {
      client: apiClient,
      expression: expressionApi,
      user: userApi
    },
    operations,
    queryClient,
  };

  // Wait for initial setup before rendering children
  if (!isReady) {
    return null;
  }

  return (
    <ApiContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ApiContext.Provider>
  );
};
