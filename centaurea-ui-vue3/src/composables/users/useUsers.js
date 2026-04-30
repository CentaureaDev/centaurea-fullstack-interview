import { useQuery } from '@tanstack/vue-query';
import { useApi } from '../../plugins/apiPlugin.js';

/**
 * Composable for fetching all users (admin only).
 *
 * @param {object} [options] - Additional vue-query options
 * @returns TanStack query with data (Ref<array>), isLoading, isError, error
 *
 * @example
 * const { data: usersData, isLoading, isError, error } = useUsers();
 * const users = computed(() => usersData.value ?? []);
 */
export function useUsers(options = {}) {
  const { operations } = useApi();
  return useQuery({
    ...operations.users.list(),
    ...options,
  });
}
