import { useQuery } from '@tanstack/vue-query';
import { useApi } from '../../plugins/apiPlugin.js';

/**
 * Composable for fetching sample expressions.
 *
 * @param {object} [options] - Additional vue-query options
 * @returns TanStack query with data (Ref<array>), isFetching, isError, error, refetch
 *
 * @example
 * const { data: samplesData, isFetching, refetch } = useSamples();
 * const samples = computed(() => samplesData.value ?? []);
 */
export function useSamples(options = {}) {
  const { operations } = useApi();
  return useQuery({
    ...operations.expressions.samples(),
    ...options,
  });
}
