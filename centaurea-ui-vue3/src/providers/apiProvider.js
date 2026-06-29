import { MutationCache, QueryCache, QueryClient } from '@tanstack/vue-query';
import { createApiStack, createQueryErrorHandler, DEFAULT_QUERY_OPTIONS } from 'centaurea-ui-shared';
import { ApiKey } from './keys';

export function provideApi(app, { apiUrl, auth, notifications, router }) {
  const handleQueryError = createQueryErrorHandler({
    onError: (message) => notifications.notify('error', message),
  });

  const queryClient = new QueryClient({
    queryCache: new QueryCache({ onError: handleQueryError }),
    mutationCache: new MutationCache({ onError: handleQueryError }),
    defaultOptions: DEFAULT_QUERY_OPTIONS,
  });

  const stack = createApiStack({
    apiUrl,
    queryClient,
    getToken: () => auth.getToken(),
    onUnauthorized: () => handleUnauthorized({ auth, router }),
    onForbidden: () => notifications.notify('error', 'Access denied. Admin access required.'),
  });

  app.provide(ApiKey, stack);
  return stack;
}

function handleUnauthorized({ auth, router }) {
  const currentPath = router.currentRoute.value.fullPath;
  auth.logout();

  if (router.currentRoute.value.path !== '/auth') {
    void router.replace({ path: '/auth', query: { redirect: currentPath } });
  }
}
