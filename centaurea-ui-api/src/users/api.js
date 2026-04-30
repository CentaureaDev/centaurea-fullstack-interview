// @ts-check
/**
 * User API
 * 
 * API functions for user operations
 */

/**
 * Create user API with configured client
 * @param {import('../apiClient').ApiClient} client - Configured API client
 * @returns {import('../index').UserApi}
 */
export function createUserApi(client) {
  return {
    /**
     * Get all users (admin only)
     * @returns {Promise<import('../index').User[]>}
     */
    async getUsers() {
      return client.get('/admin/users');
    },
  };
}
