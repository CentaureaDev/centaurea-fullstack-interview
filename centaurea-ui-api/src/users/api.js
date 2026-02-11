/**
 * User API
 * 
 * API functions for user operations
 */

/**
 * Create user API with configured client
 * @param {ApiClient} client - Configured API client
 */
export function createUserApi(client) {
  return {
    /**
     * Get all users (admin only)
     * @returns {Promise<Array>}
     */
    async getUsers() {
      return client.get('/admin/users');
    },
  };
}
