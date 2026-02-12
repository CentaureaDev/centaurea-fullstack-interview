// @ts-check
/**
 * Token Storage Interface
 * 
 * This interface defines the contract for token storage implementations.
 * Apps can provide different implementations (localStorage, sessionStorage, memory, etc.)
 */

/**
 * @typedef {Object} ITokenStorage
 * @property {(key: string) => (string|null)} getItem - Retrieves an item from storage
 * @property {(key: string, value: string) => void} setItem - Stores an item in storage
 * @property {(key: string) => void} removeItem - Removes an item from storage
 */

/**
 * LocalStorage implementation of ITokenStorage
 */
export class LocalTokenStorage {
  /**
   * @param {string} key - Storage key
   * @returns {string|null} Stored value or null
   */
  getItem(key) {
    return localStorage.getItem(key);
  }

  /**
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   * @returns {void}
   */
  setItem(key, value) {
    localStorage.setItem(key, value);
  }

  /**
   * @param {string} key - Storage key
   * @returns {void}
   */
  removeItem(key) {
    localStorage.removeItem(key);
  }
}

/**
 * SessionStorage implementation of ITokenStorage
 */
export class SessionTokenStorage {
  /**
   * @param {string} key - Storage key
   * @returns {string|null} Stored value or null
   */
  getItem(key) {
    return sessionStorage.getItem(key);
  }

  /**
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   * @returns {void}
   */
  setItem(key, value) {
    sessionStorage.setItem(key, value);
  }

  /**
   * @param {string} key - Storage key
   * @returns {void}
   */
  removeItem(key) {
    sessionStorage.removeItem(key);
  }
}

/**
 * In-memory storage implementation (useful for testing or SSR)
 */
export class MemoryTokenStorage {
  constructor() {
    /** @type {Map<string, string>} */
    this.storage = new Map();
  }

  /**
   * @param {string} key - Storage key
   * @returns {string|null} Stored value or null
   */
  getItem(key) {
    return this.storage.get(key) || null;
  }

  /**
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   * @returns {void}
   */
  setItem(key, value) {
    this.storage.set(key, value);
  }

  /**
   * @param {string} key - Storage key
   * @returns {void}
   */
  removeItem(key) {
    this.storage.delete(key);
  }
}
