import { MutationCache, QueryCache, QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { createApiStack, createQueryErrorHandler, DEFAULT_QUERY_OPTIONS } from 'centaurea-ui-shared';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthProvider';
import { useNotification } from './NotificationProvider';

const ApiContext = createContext(null);
const DEFAULT_EXPRESSION_HISTORY_LIMIT = 100;

const useApiContext = () => {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApi must be used within ApiProvider');
  return ctx;
};

export const ApiProvider = ({ children, apiUrl }) => {
  const auth = useAuth();
  const notification = useNotification();

  const authManager = auth?.manager;
  const notifyError = notification?.notifyError;

  const authManagerRef = useRef(authManager);
  const notifyErrorRef = useRef(notifyError);

  const [{ operations, queryClient }] = useState(() => {
    const handleQueryError = createQueryErrorHandler({
      onError: (message) => notifyErrorRef.current?.(message),
    });
    const hostQueryClient = new QueryClient({
      queryCache: new QueryCache({ onError: handleQueryError }),
      mutationCache: new MutationCache({ onError: handleQueryError }),
      defaultOptions: DEFAULT_QUERY_OPTIONS,
    });

    return createApiStack({
      apiUrl,
      queryClient: hostQueryClient,
      getToken: () => authManagerRef.current?.getToken() || null,
      onUnauthorized: () => authManagerRef.current?.logout?.(),
      onForbidden: () => notifyErrorRef.current?.('Access denied. Admin access required.'),
    });
  });

  useEffect(() => {
    authManagerRef.current = authManager;
    notifyErrorRef.current = notifyError;
  }, [authManager, notifyError]);

  useEffect(() => () => queryClient.clear(), [queryClient]);

  const value = useMemo(() => ({ operations }), [operations]);

  return (
    <ApiContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ApiContext.Provider>
  );
};

function useApiOperations() {
  const { operations } = useApiContext();
  return operations;
}

export function useCalculate() {
  const operations = useApiOperations();
  return useMutation(operations.calculateExpression());
}

export function useExpressionHistory({ limit = DEFAULT_EXPRESSION_HISTORY_LIMIT } = {}) {
  const operations = useApiOperations();
  const options = useMemo(() => operations.expressionHistory(limit), [operations, limit]);
  return useQuery(options);
}

export function useClearHistory() {
  const operations = useApiOperations();
  return useMutation(operations.clearExpressionHistory());
}

export function useUpdateComputedTime() {
  const operations = useApiOperations();
  return useMutation(operations.updateExpressionComputedTime());
}

export function useSamples() {
  const operations = useApiOperations();
  const options = useMemo(() => operations.expressionSamples(), [operations]);
  return useQuery(options);
}

export function useUsers() {
  const operations = useApiOperations();
  const options = useMemo(() => operations.userList(), [operations]);
  return useQuery(options);
}