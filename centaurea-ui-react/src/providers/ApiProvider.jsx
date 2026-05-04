import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiClient, ApiOperations } from 'centaurea-ui-shared';
import { createContext, useContext, useMemo } from 'react';

const ApiContext = createContext(null);

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children, apiUrl, getToken, onUnauthorized, onForbidden }) => {
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 } },
  }), []);

  const api = useMemo(
    () => new ApiClient(apiUrl, getToken, onUnauthorized, onForbidden),
    [apiUrl, getToken, onUnauthorized, onForbidden]
  );

  const operations = useMemo(
    () => new ApiOperations(api, queryClient),
    [api, queryClient]
  );

  return (
    <ApiContext.Provider value={{ api, operations, queryClient }}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ApiContext.Provider>
  );
};
