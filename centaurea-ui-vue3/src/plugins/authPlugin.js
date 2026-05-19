import { configureAuth } from 'centaurea-ui-shared';
import { computed, inject, reactive } from 'vue';

const AUTH_KEY = Symbol('auth');

// module-level manager for use outside Vue components (e.g. in apiPlugin)
let _authManager = null;
export const getAuthToken = () => _authManager?.getToken() ?? null;
export const triggerAuthLogout = () => _authManager?.logout();

function createAuthContext(authManager) {
  const snapshot = authManager.getSnapshot();
  const state = reactive({
    user: snapshot.user,
    token: snapshot.token,
    isLoading: snapshot.isLoading,
  });

  const unsubscribe = authManager.subscribe((nextSnapshot) => {
    state.user = nextSnapshot.user;
    state.token = nextSnapshot.token;
    state.isLoading = nextSnapshot.isLoading;
  });

  const auth = reactive({
    user: computed(() => state.user),
    token: computed(() => state.token),
    isLoading: computed(() => state.isLoading),
    isAuthenticated: computed(() => !!state.user && !!state.token),
    register: (name, email, password) => authManager.register(name, email, password),
    login: (email, password) => authManager.login(email, password),
    logout: () => authManager.logout(),
  });

  return { auth, unsubscribe };
}

export function createAuthPlugin(apiUrl) {
  return {
    install(app) {
      const manager = configureAuth(apiUrl);
      const { auth, unsubscribe } = createAuthContext(manager);
      _authManager = manager;
      app.provide(AUTH_KEY, auth);

      if (typeof app.onUnmount === 'function') {
        app.onUnmount(() => {
          unsubscribe();
          _authManager = null;
        });
      }
    },
  };
}

export const useAuth = () => {
  const auth = inject(AUTH_KEY);
  return auth;
};
