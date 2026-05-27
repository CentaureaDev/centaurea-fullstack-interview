import { createRouter, createWebHistory } from 'vue-router';

let authManager = null;

export function setAuthManager(manager) {
  authManager = manager;
}

const routes = [
  {
    path: '/calculator',
    name: 'Calculator',
    component: () => import('@/views/CalculatorView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    redirect: '/calculator',
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/HistoryView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/samples',
    name: 'Samples',
    component: () => import('@/views/SamplesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@/views/AuthView.vue'),
  },
  {
    path: '/login',
    redirect: (to) => ({ path: '/auth', query: to.query }),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: () => {
      const snapshot = authManager?.getSnapshot();
      return snapshot?.token ? '/calculator' : '/auth';
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const snapshot = authManager?.getSnapshot();
  const isAuthenticated = Boolean(snapshot?.token);

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { path: '/auth', query: { redirect: to.fullPath } };
  }

  if (to.path === '/auth' && isAuthenticated) {
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : '/calculator';
    return { path: redirect };
  }

  return true;
});

export default router;
