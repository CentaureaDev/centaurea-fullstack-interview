import { useQuery } from '@tanstack/vue-query';
import { useApi } from '../../plugins/apiPlugin.js';

/**
 * Composable for fetching expression history.
 *
 * @param {number} [limit=100] - Maximum number of history items to fetch
 * @param {object} [options] - Additional vue-query options
 * @returns TanStack query with data (Ref<array>), isLoading, isFetching, isError, error, refetch
 *
 * @example
 * const { data: historyData, isLoading, refetch } = useExpressionHistory();
 * const history = computed(() => historyData.value ?? []);
 */
export function useExpressionHistory(limit = 100, options = {}) {
  const { operations } = useApi();
  return useQuery({
    ...operations.expressions.history(limit),
    ...options,
  });
}
