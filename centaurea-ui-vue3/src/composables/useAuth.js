import { useStore } from '@/composables/useStore';
import { AuthKey } from '@/providers/keys';
import { computed, inject } from 'vue';

export function useAuth() {
  const manager = inject(AuthKey);
  if (!manager) {
    throw new Error('useAuth() requires provideAuth() in main.js');
  }

  const state = useStore(manager);

  return {
    user: computed(() => state.value.user),
    token: computed(() => state.value.token),
    isLoading: computed(() => state.value.isLoading),
    isAuthenticated: computed(() => Boolean(state.value.user) && Boolean(state.value.token)),
    register: manager.register.bind(manager),
    login: manager.login.bind(manager),
    logout: manager.logout.bind(manager),
    getToken: manager.getToken.bind(manager),
  };
}
