export { AuthManager, authManager, configureAuth } from './authManager.js';
export { userStore } from './userStore.js';
export {
  LocalTokenStorage,
  SessionTokenStorage,
  MemoryTokenStorage,
} from './tokenStorage.js';

// Re-export typedefs for JSDoc type checking
/**
 * @typedef {import('./tokenStorage.js').ITokenStorage} ITokenStorage
 */

/**
 * @typedef {import('./authManager.js').User} User
 */

/**
 * @typedef {import('./authManager.js').AuthResponse} AuthResponse
 */
