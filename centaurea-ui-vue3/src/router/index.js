import { createRouter, createWebHistory } from 'vue-router';
import { appStore } from '../store/appStore';
import AuthPage from '../pages/AuthPage.vue';
import CalculatorPage from '../pages/CalculatorPage.vue';
import HistoryPage from '../pages/HistoryPage.vue';
import SamplesPage from '../pages/SamplesPage.vue';
import AdminPage from '../pages/AdminPage.vue';

const routes = [
  {
    path: '/auth',
    name: 'Auth',
    component: AuthPage,
    beforeEnter: (to, from, next) => {
      const user = appStore.getUser();
      if (user) {
        next('/calculator');
      } else {
        next();
      }
    }
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: CalculatorPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/samples',
    name: 'Samples',
    component: SamplesPage
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage
  },
  {
    path: '/',
    redirect: to => {
      const user = appStore.getUser();
      return user ? '/calculator' : '/auth';
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: to => {
      const user = appStore.getUser();
      return user ? '/calculator' : '/auth';
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const user = appStore.getUser();
  
  if (to.meta.requiresAuth && !user) {
    next('/auth');
  } else {
    next();
  }
});

export default router;
