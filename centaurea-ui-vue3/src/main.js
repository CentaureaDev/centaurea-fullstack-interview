import App from '@/App.vue';
import { provideApi } from '@/providers/apiProvider';
import { provideAuth } from '@/providers/authProvider';
import { provideNotifications } from '@/providers/notificationProvider';
import router, { setAuthManager } from '@/router';
import { MutationCache, QueryCache, QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { createQueryErrorHandler, DEFAULT_QUERY_OPTIONS } from 'centaurea-ui-shared';
import 'centaurea-ui-shared/styles';
import { createApp } from 'vue';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5034/api';

const app = createApp(App);

const notifications = provideNotifications(app);
const auth = provideAuth(app, { apiUrl });

const handleQueryError = createQueryErrorHandler({
  onError: (message) => notifications.notify('error', message),
});

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleQueryError }),
  mutationCache: new MutationCache({ onError: handleQueryError }),
  defaultOptions: DEFAULT_QUERY_OPTIONS,
});

const apiStack = provideApi(app, {
  apiUrl,
  queryClient,
  getToken: () => auth.getToken(),
  onUnauthorized: () => {
    const currentPath = router.currentRoute.value.fullPath;
    auth.logout();

    if (router.currentRoute.value.path !== '/auth') {
      void router.replace({ path: '/auth', query: { redirect: currentPath } });
    }
  },
  onForbidden: () => notifications.notify('error', 'Access denied. Admin access required.'),
});

setAuthManager(auth);
app.use(VueQueryPlugin, { queryClient: apiStack.queryClient });
app.use(router);
app.mount('#app');

