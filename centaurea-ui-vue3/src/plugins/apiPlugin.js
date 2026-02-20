/**
 * apiPlugin - Vue Plugin integration for centaurea-ui-api
 *
 * Provides API client, TanStack Query operations, and QueryClient to Vue components.
 * Works in conjunction with authPlugin to handle authenticated API requests.
 *
 * Usage:
 * 1. Install the plugin in main.js after authPlugin:
 *    app.use(createApiPlugin(apiUrl, () => getAuthToken(), () => triggerAuthLogout(), () => {}))
 * 2. Use useApi() composable in any component/composable to access: api, operations, queryClient
 *
 * Features:
 * - TanStack Query (vue-query) integration with configured QueryClient
 * - Automatic token management via getToken callback
 * - Auto-logout on 401 (unauthorized) responses
 * - Centralized API operations for expressions and users
 */

import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import { ApiClient, createExpressionApi, createOperations, createUserApi } from 'centaurea-ui-api';
import { inject } from 'vue';

const API_KEY = Symbol('api');

/**
 * Create the Vue API plugin
 * @param {string} apiUrl - Base API URL
 * @param {() => string | null} getToken - Callback returning current auth token
 * @param {() => void} onUnauthorized - Callback when a request returns 401
 * @param {() => void} onForbidden - Callback when a request returns 403
 * @returns {import('vue').Plugin}
 */
export function createApiPlugin(apiUrl, getToken, onUnauthorized, onForbidden) {
  return {
    install(app) {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
          },
        },
      });

      const apiClient = new ApiClient(apiUrl, getToken, onUnauthorized, onForbidden);
      const expressionApi = createExpressionApi(apiClient);
      const userApi = createUserApi(apiClient);

      const api = {
        client: apiClient,
        expression: expressionApi,
        user: userApi,
      };

      const operations = createOperations(api, queryClient);

      // Install VueQueryPlugin with the configured QueryClient
      app.use(VueQueryPlugin, { queryClient });

      app.provide(API_KEY, {
        api,
        operations,
        queryClient,
      });
    },
  };
}

/**
 * Composable to access API operations and query client.
 * Must be used inside a component or composable within the app.
 * @returns {{ api: object, operations: object, queryClient: QueryClient }}
 */
export function useApi() {
  const context = inject(API_KEY);
  if (!context) throw new Error('useApi must be used within an app that has apiPlugin installed');
  return context;
}
