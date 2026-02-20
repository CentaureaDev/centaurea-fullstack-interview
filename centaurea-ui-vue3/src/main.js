import { createApp } from 'vue';
import 'centaurea-ui-shared/styles';
import App from './App.vue';
import router from './router';
import { createAuthPlugin, createApiPlugin, getAuthToken, triggerAuthLogout } from './plugins/index.js';

const apiUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:5034/api';

const app = createApp(App);

app.use(router);
app.use(createAuthPlugin(apiUrl));
app.use(createApiPlugin(
  apiUrl,
  () => getAuthToken(),
  () => triggerAuthLogout(),
  () => { console.warn('Access forbidden'); },
));

app.mount('#app');

