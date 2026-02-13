export { AuthManager, configureAuth } from './authManager.js';
export { Observable } from './observable.js';
export {
    LocalTokenStorage, MemoryTokenStorage, SessionTokenStorage
} from './tokenStorage.js';
export { createUserStore } from './userStore.js';

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
