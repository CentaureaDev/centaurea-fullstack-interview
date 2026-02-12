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
 * User Store
 * 
 * Shared observable instance for user state management.
 * Stores the current authenticated user or null when logged out.
 * 
 * @type {Observable<(User|null)>}
 */

export const userStore = new Observable(null);
