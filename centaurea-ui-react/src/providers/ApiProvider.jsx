import { MutationCache, QueryCache, QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { ApiClient, ApiOperations, toUiError } from 'centaurea-ui-shared';
import { createContext, useContext, useMemo, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { useNotification } from './NotificationProvider';

const ApiContext = createContext(null);

const useApiContext = () => useContext(ApiContext);

export const ApiProvider = ({ children, apiUrl }) => {
  const auth = useAuth();
  const { notifyError } = useNotification();

  // Stable ref so QueryCache/MutationCache (created once) always call the latest notifyError
  const notifyErrorRef = useRef(notifyError);
  notifyErrorRef.current = notifyError;

  const handleGlobalError = (error) => {
    const uiError = toUiError(error);
    if (uiError.status === 401) return;
    notifyErrorRef.current(uiError.message);
  };

  const queryClient = useMemo(() => new QueryClient({
    queryCache: new QueryCache({ onError: handleGlobalError }),
    mutationCache: new MutationCache({ onError: handleGlobalError }),
    defaultOptions: {
      queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 },
    },
  }), []);

  const getToken = () => auth?.token || null;
  const onUnauthorized = () => auth?.logout?.();
  const onForbidden = () => notifyErrorRef.current('Access denied. Admin access required.');

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
