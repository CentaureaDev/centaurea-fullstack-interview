/**
 * Token Storage Interface
 * 
 * This interface defines the contract for token storage implementations.
 * Apps can provide different implementations (localStorage, sessionStorage, memory, etc.)
 */

/**
 * @typedef {Object} ITokenStorage
 * @property {function(string): string|null} getItem - Retrieves an item from storage
 * @property {function(string, string): void} setItem - Stores an item in storage
 * @property {function(string): void} removeItem - Removes an item from storage
 */

/**
 * LocalStorage implementation of ITokenStorage
 */
export class LocalTokenStorage {
  getItem(key) {
    return localStorage.getItem(key);
  }

  setItem(key, value) {
    localStorage.setItem(key, value);
  }

  removeItem(key) {
    localStorage.removeItem(key);
  }
}

/**
 * SessionStorage implementation of ITokenStorage
 */
export class SessionTokenStorage {
  getItem(key) {
    return sessionStorage.getItem(key);
  }

  setItem(key, value) {
    sessionStorage.setItem(key, value);
  }

  removeItem(key) {
    sessionStorage.removeItem(key);
  }
}

/**
 * In-memory storage implementation (useful for testing or SSR)
 */
export class MemoryTokenStorage {
  constructor() {
    this.storage = new Map();
  }

  getItem(key) {
    return this.storage.get(key) || null;
  }

  setItem(key, value) {
    this.storage.set(key, value);
  }

  removeItem(key) {
    this.storage.delete(key);
  }
}
