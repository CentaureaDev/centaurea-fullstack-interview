/**
 * AuthManager
 * 
 * Simple authentication manager for login, logout, and registration.
 * Errors are not handled - they bubble up to the caller.
 */

export class AuthManager {
  /**
   * @param {string} apiUrl - Base URL for API endpoints
   * @param {ITokenStorage} tokenStorage - Implementation of token storage interface
   */
  constructor(apiUrl, tokenStorage) {
    this.apiUrl = apiUrl;
    this.tokenStorage = tokenStorage;
    this.tokenKey = 'authToken';
    this.userKey = 'authUser';
  }

  /**
   * Get the current authentication token
   * @returns {string|null}
   */
  getToken() {
    return this.tokenStorage.getItem(this.tokenKey);
  }

  /**
   * Get the current user
   * @returns {object|null}
   */
  getUser() {
    const userJson = this.tokenStorage.getItem(this.userKey);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /**
   * Register a new user and store credentials
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} User object
   */
  async register(name, email, password) {
    const response = await fetch(`${this.apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      this.tokenStorage.setItem(this.tokenKey, data.token);
      this.tokenStorage.setItem(this.userKey, JSON.stringify(data.user));
      return data.user;
    }
    
    throw new Error(data.error || 'Registration failed');
  }

  /**
   * Login with email and password and store credentials
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} User object
   */
  async login(email, password) {
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      this.tokenStorage.setItem(this.tokenKey, data.token);
      this.tokenStorage.setItem(this.userKey, JSON.stringify(data.user));
      return data.user;
    }
    
    throw new Error(data.error || 'Login failed');
  }

  /**
   * Logout and clear stored credentials
   */
  logout() {
    this.tokenStorage.removeItem(this.tokenKey);
    this.tokenStorage.removeItem(this.userKey);
  }
}

// Default instance with configured API URL
// Apps can configure this or create their own instance
export let authManager = null;

/**
 * Configure the default auth manager instance
 * @param {string} apiUrl - Base URL for API endpoints
 * @param {ITokenStorage} tokenStorage - Implementation of token storage interface
 */
export function configureAuth(apiUrl, tokenStorage) {
  authManager = new AuthManager(apiUrl, tokenStorage);
  return authManager;
}
