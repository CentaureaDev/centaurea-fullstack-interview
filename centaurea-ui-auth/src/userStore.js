// @ts-check
import { Observable } from './observable.js';

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} email
 * @property {boolean} isAdmin
 */

/**
 * Factory function to create a new user store instance
 * 
 * Useful for testing or situations where you need independent user stores.
 * 
 * @param {User|null} [initialUser=null] - Initial user value
 * @returns {Observable<(User|null)>} New user store observable instance
 * 
 * @example
 * const testStore = createUserStore({ id: 1, username: 'test', email: 'test@example.com', isAdmin: false });
 * const unsubscribe = testStore.subscribe(user => console.log('User:', user));
 */
export function createUserStore(initialUser = null) {
  return new Observable(initialUser);
}

