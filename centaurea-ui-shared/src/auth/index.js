import { createApiError } from '../utils/errorUtils.js';

export class LocalTokenStorage {
  getItem(key) { return localStorage.getItem(key); }

  setItem(key, value) { localStorage.setItem(key, value); }

  removeItem(key) { localStorage.removeItem(key); }
}

export class AuthManager {
  constructor(apiUrl, tokenStorage) {
    this.apiUrl = apiUrl;
    this.tokenStorage = tokenStorage;
    this.tokenKey = 'authToken';
    this.userKey = 'authUser';
    this.onUserChange = undefined;
  }

  getToken() { return this.tokenStorage.getItem(this.tokenKey); }

  getUser() {
    const json = this.tokenStorage.getItem(this.userKey);
    try { return json ? JSON.parse(json) : null; } catch { return null; }
  }

  async register(name, email, password) {
    return this.#saveSession(await this.#postAuth('/auth/register', { name, email, password }, 'Registration failed'));
  }

  async login(email, password) {
    return this.#saveSession(await this.#postAuth('/auth/login', { email, password }, 'Sign in failed'));
  }

  logout() {
    this.tokenStorage.removeItem(this.tokenKey);
    this.tokenStorage.removeItem(this.userKey);
    this.onUserChange?.(null, null);
  }

  async #postAuth(path, body, fallbackMessage) {
    const res = await fetch(`${this.apiUrl}${path}`, {
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
    this.tokenStorage.setItem(this.tokenKey, data.token);
    this.tokenStorage.setItem(this.userKey, JSON.stringify(data.user));
    this.onUserChange?.(data.user, data.token);
    return { token: data.token, user: data.user };
  }
}

export const configureAuth = (apiUrl) => new AuthManager(apiUrl, new LocalTokenStorage());
