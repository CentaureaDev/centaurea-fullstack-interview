import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { ApiClient, ApiOperations } from 'centaurea-ui-shared';
import { inject } from 'vue';

const API_KEY = Symbol('api');

export function createApiPlugin(apiUrl, getToken, onUnauthorized, onForbidden) {
  return {
    install(app) {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 } },
      });

      const api = new ApiClient(apiUrl, getToken, onUnauthorized, onForbidden);

      const operations = new ApiOperations(api, queryClient);

      app.use(VueQueryPlugin, { queryClient });
      app.provide(API_KEY, { api, operations, queryClient });
    },
  };
}

export const useApi = () => {
  const context = inject(API_KEY);
  return context;
};
