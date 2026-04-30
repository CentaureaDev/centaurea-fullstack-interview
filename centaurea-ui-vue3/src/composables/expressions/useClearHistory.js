import { useMutation } from '@tanstack/vue-query';
import { useApi } from '../../plugins/apiPlugin.js';

/**
 * Composable for clearing all expression history.
 *
 * @param {object} [options] - TanStack mutation options (onSuccess, onError, onSettled)
 * @returns TanStack mutation with mutate, isPending, error
 *
 * @example
 * const { mutate: clearHistory, isPending: isClearingHistory } = useClearHistory({
 *   onSuccess: () => console.log('History cleared'),
 * });
 */
export function useClearHistory(options = {}) {
  const { operations } = useApi();
  return useMutation({
    ...operations.expressions.clearHistory(),
    ...options,
  });
}
