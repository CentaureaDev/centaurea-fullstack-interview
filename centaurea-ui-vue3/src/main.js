import { VueQueryPlugin } from '@tanstack/vue-query';
import 'centaurea-ui-shared/styles';
import { createApp } from 'vue';

import App from '@/App.vue';
import { provideApi } from '@/providers/apiProvider';
import { provideAuth } from '@/providers/authProvider';
import { provideNotifications } from '@/providers/notificationProvider';
import router, { setAuthManager } from '@/router';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5034/api';

const app = createApp(App);

const notifications = provideNotifications(app);
const auth = provideAuth(app, { apiUrl });
const apiStack = provideApi(app, { apiUrl, auth, notifications, router });

setAuthManager(auth);
app.use(VueQueryPlugin, { queryClient: apiStack.queryClient });
app.use(router);
app.mount('#app');

