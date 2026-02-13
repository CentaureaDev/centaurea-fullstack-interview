import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../providers';

/**
 * Hook for fetching all users (admin only)
 * @param {Object} [options] - Additional react-query options
 * @returns {Object} Query object
 * @property {Array} [data] - Array of user objects with id, username, email, roles
 * @property {boolean} isLoading - Whether the query is in progress
 * @property {Error|null} error - Error object if query failed (e.g., 403 if not admin), null otherwise
 * @property {Function} refetch - Function to manually refetch the data
 * @property {boolean} isError - Whether an error occurred
 * @property {string} status - Current status: 'pending' | 'success' | 'error'
 * 
 * @example
 * const { data: users, isLoading, error } = useUsers({
 *   enabled: isAdmin, // Only fetch if user is admin
 * });
 */
export function useUsers(options = {}) {
  const { operations } = useApi();

  // @ts-ignore - operations.users.list() returns properly typed query config
  return useQuery({
    ...operations.users.list(),
    ...options,
  });
}
