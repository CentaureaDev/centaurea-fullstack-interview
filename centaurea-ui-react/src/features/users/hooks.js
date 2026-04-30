import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../providers';

/**
 * Hook for fetching all users (admin only)
 * 
 * @param {Object} [options] - Additional react-query options
 * @returns {{
 *   data: Array<{id: number, username: string, email: string, roles: string[]}> | undefined,
 *   isLoading: boolean,
 *   isFetching: boolean,
 *   isError: boolean,
 *   error: Error | null,
 *   refetch: () => Promise<any>,
 *   status: 'pending' | 'success' | 'error'
 * }} TanStack Query query object with:
 * - `data`: Array of user objects (undefined while loading)
 * - `isLoading`: True on initial load
 * - `isFetching`: True whenever data is being fetched
 * - `isError`: True if the query encountered an error (e.g., 403 if not admin)
 * - `error`: Error object if query failed
 * - `refetch`: Function to manually trigger a refetch
 * - `status`: Current query state
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
