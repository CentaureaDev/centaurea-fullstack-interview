// @ts-check
import { LocalTokenStorage } from './tokenStorage.js';

/**
 * Token storage interface
 * @typedef {Object} ITokenStorage
 * @property {(key: string) => (string|null)} getItem - Retrieves an item from storage
 * @property {(key: string, value: string) => void} setItem - Stores an item in storage
 * @property {(key: string) => void} removeItem - Removes an item from storage
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} email
 * @property {boolean} isAdmin
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} token - JWT token
 * @property {User} user - User object
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} RegisterCredentials
 * @property {string} username
 * @property {string} email
 * @property {string} password
 */

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
   * @returns {User|null}
   */
  getUser() {
    const userJson = this.tokenStorage.getItem(this.userKey);
    if (!userJson) return null;
    
    try {
      /** @type {User} */
      const user = JSON.parse(userJson);
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Register a new user and store credentials
   * @param {string} name - User's full name
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<AuthResponse>} Auth response with token and user
   * @throws {Error} If registration fails
   */
  async register(name, email, password) {
    const response = await fetch(`${this.apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    /** @type {any} */
    const data = await response.json();
    
    if (response.ok) {
      this.tokenStorage.setItem(this.tokenKey, data.token);
      this.tokenStorage.setItem(this.userKey, JSON.stringify(data.user));
      return { token: data.token, user: data.user };
    }
    
    throw new Error(data.error || 'Registration failed');
  }

  /**
   * Login with email and password and store credentials
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<AuthResponse>} Auth response with token and user
   * @throws {Error} If login fails
   */
  async login(email, password) {
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    /** @type {any} */
    const data = await response.json();
    
    if (response.ok) {
      this.tokenStorage.setItem(this.tokenKey, data.token);
      this.tokenStorage.setItem(this.userKey, JSON.stringify(data.user));
      return { token: data.token, user: data.user };
    }
    
    throw new Error(data.error || 'Login failed');
  }

  /**
   * Logout and clear stored credentials
   * @returns {void}
   */
  logout() {
    this.tokenStorage.removeItem(this.tokenKey);
    this.tokenStorage.removeItem(this.userKey);
  }
}

// Default instance with configured API URL
// Apps can configure this or create their own instance
/** @type {AuthManager | null} */
export let authManager = null;

/**
 * Configure the default auth manager instance
 * @param {string} apiUrl - Base URL for API endpoints
 * @param {ITokenStorage} [tokenStorage] - Implementation of token storage interface (defaults to LocalTokenStorage)
 * @returns {AuthManager} Configured auth manager instance
 */
export function configureAuth(apiUrl, tokenStorage) {
  /** @type {ITokenStorage} */
  let storage = tokenStorage || new LocalTokenStorage();
  authManager = new AuthManager(apiUrl, storage);
  return authManager;
}
