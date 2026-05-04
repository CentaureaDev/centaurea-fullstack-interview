import { configureAuth } from 'centaurea-ui-shared';
import { computed, inject, reactive, toRef } from 'vue';

const AUTH_KEY = Symbol('auth');

// module-level ref for use outside Vue components (e.g. in apiPlugin)
let _authInstance = null;
export const getAuthToken = () => _authInstance?.token ?? null;
export const triggerAuthLogout = () => _authInstance?.logout();

function createAuthContext(authManager) {
  const state = reactive({ user: null, token: null, isLoading: true });

  authManager.onUserChange = (user, token) => {
    state.user = user;
    state.token = token;
    state.isLoading = false;
  };

  const storedUser = authManager.getUser();
  const storedToken = authManager.getToken();
  if (storedUser && storedToken) {
    state.user = storedUser;
    state.token = storedToken;
  }
  state.isLoading = false;

  return reactive({
    user: toRef(state, 'user'),
    token: toRef(state, 'token'),
    isLoading: toRef(state, 'isLoading'),
    isAuthenticated: computed(() => !!state.user && !!state.token),
    register: (name, email, password) => authManager.register(name, email, password),
    login: (email, password) => authManager.login(email, password),
    logout: () => authManager.logout(),
  });
}

export function createAuthPlugin(apiUrl) {
  return {
    install(app) {
      const auth = createAuthContext(configureAuth(apiUrl));
      _authInstance = auth;
      app.provide(AUTH_KEY, auth);
    },
  };
}

export const useAuth = () => {
  const auth = inject(AUTH_KEY);
  return auth;
};
