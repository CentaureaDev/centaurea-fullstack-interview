import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../providers';

/**
 * Hook for fetching all users (admin only)
 * @param {Object} [options] - Additional react-query options
 * @returns {Object} Query object with data, isLoading, error, refetch
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
