import { createApiError } from '../utils/errorUtils.js';
import { StatefulManager } from '../state/index.js';

class LocalTokenStorage {
  getItem(key) { return localStorage.getItem(key); }

  setItem(key, value) { localStorage.setItem(key, value); }

  removeItem(key) { localStorage.removeItem(key); }
}

class AuthManager extends StatefulManager {
  #apiUrl;
  #tokenStorage;
  #tokenKey = 'authToken';
  #userKey = 'authUser';

  constructor(apiUrl, tokenStorage) {
    super({ user: null, token: null, isLoading: true });
    this.#apiUrl = apiUrl;
    this.#tokenStorage = tokenStorage;
    this.#hydrate();
  }

  getToken() { return this.getSnapshot().token; }

  getUser() { return this.getSnapshot().user; }

  async register(name, email, password) {
    const data = await this.#postAuth('/auth/register', { name, email, password }, 'Registration failed');
    return this.#saveSession(data);
  }

  async login(email, password) {
    const data = await this.#postAuth('/auth/login', { email, password }, 'Sign in failed');
    return this.#saveSession(data);
  }

  logout() {
    this.#tokenStorage.removeItem(this.#tokenKey);
    this.#tokenStorage.removeItem(this.#userKey);
    this.setState({ user: null, token: null, isLoading: false });
  }

  #hydrate() {
    const token = this.#tokenStorage.getItem(this.#tokenKey);
    const user = this.#readUser();

    this.setState({
      user: user ?? null,
      token: token ?? null,
      isLoading: false,
    });
  }

  #readUser() {
    const json = this.#tokenStorage.getItem(this.#userKey);
    try {
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  }

  async #postAuth(path, body, fallbackMessage) {
    const res = await fetch(`${this.#apiUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await this.#parseJsonSafe(res);

    if (!res.ok) {
      throw createApiError(res.status, data, fallbackMessage);
    }

    return data;
  }

  async #parseJsonSafe(response) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  #saveSession(data) {
    this.#tokenStorage.setItem(this.#tokenKey, data.token);
    this.#tokenStorage.setItem(this.#userKey, JSON.stringify(data.user));
    this.setState({ user: data.user, token: data.token, isLoading: false });
    return { token: data.token, user: data.user };
  }
}

export { AuthManager };
export const configureAuth = (apiUrl) => new AuthManager(apiUrl, new LocalTokenStorage());
