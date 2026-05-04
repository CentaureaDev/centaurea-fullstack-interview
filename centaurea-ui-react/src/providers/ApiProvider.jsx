import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { ApiClient, ApiOperations } from 'centaurea-ui-shared';
import { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthProvider';

const ApiContext = createContext(null);

const useApiContext = () => useContext(ApiContext);

export const ApiProvider = ({ children, apiUrl }) => {
  const auth = useAuth();

  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 } },
  }), []);

  const getToken = () => auth?.token || null;
  const onUnauthorized = () => auth?.logout?.();
  const onForbidden = () => {};

  const api = useMemo(
    () => new ApiClient(apiUrl, getToken, onUnauthorized, onForbidden),
    [apiUrl, auth]
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

export function useApi({ expressionHistoryLimit = 100 } = {}) {
  const { operations } = useApiContext();
  return {
    calculate: useMutation(operations.calculateExpression()),
    getExpressionHistory: useQuery(operations.expressionHistory(expressionHistoryLimit)),
    clearHistory: useMutation(operations.clearExpressionHistory()),
    updateComputedTime: useMutation(operations.updateExpressionComputedTime()),
    getSamples: useQuery(operations.expressionSamples()),
    getUsers: useQuery(operations.userList()),
  };
}
