import { createRouter, createWebHistory } from 'vue-router';
import { getAuthToken } from '../plugins/authPlugin.js';
import AuthPage from '../pages/AuthPage.vue';
import CalculatorPage from '../pages/CalculatorPage.vue';
import HistoryPage from '../pages/HistoryPage.vue';
import SamplesPage from '../pages/SamplesPage.vue';
import AdminPage from '../pages/AdminPage.vue';

const routes = [
  { path: '/auth',       name: 'Auth',       component: AuthPage },
  { path: '/calculator', name: 'Calculator', component: CalculatorPage, meta: { requiresAuth: true } },
  { path: '/history',    name: 'History',    component: HistoryPage,    meta: { requiresAuth: true } },
  { path: '/samples',    name: 'Samples',    component: SamplesPage,    meta: { requiresAuth: true } },
  { path: '/admin',      name: 'Admin',      component: AdminPage,      meta: { requiresAuth: true } },
  { path: '/',           redirect: () => (getAuthToken() ? '/calculator' : '/auth') },
  { path: '/:pathMatch(.*)*', redirect: () => (getAuthToken() ? '/calculator' : '/auth') },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!getAuthToken();
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/auth');
  } else if (to.path === '/auth' && isAuthenticated) {
    next('/calculator');
  } else {
    next();
  }
});

export default router;
