/**
 * User Queries
 * 
 * TanStack Query configurations for user queries
 */

import { userKeys } from './keys.js';

/**
 * Create user query configurations
 * @param {Object} userApi - User API instance
 */
export function createUserQueries(userApi) {
  return {
    /**
     * Get users query config
     */
    list: () => ({
      queryKey: userKeys.list(),
      queryFn: () => userApi.getUsers(),
    }),
  };
}
