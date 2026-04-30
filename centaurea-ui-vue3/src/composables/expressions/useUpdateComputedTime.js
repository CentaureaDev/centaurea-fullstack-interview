import { useMutation } from '@tanstack/vue-query';
import { useApi } from '../../plugins/apiPlugin.js';

/**
 * Composable for updating computed time of a history item.
 *
 * @param {object} [options] - TanStack mutation options (onSuccess, onError, onSettled)
 * @returns TanStack mutation with mutate({ id, computedTime }), isPending, error
 *
 * @example
 * const { mutate: updateComputedTime, isPending: isUpdatingTime } = useUpdateComputedTime({
 *   onSuccess: () => console.log('Updated'),
 * });
 * updateComputedTime({ id: 42, computedTime: '2026-01-01T12:00:00Z' });
 */
export function useUpdateComputedTime(options = {}) {
  const { operations } = useApi();
  return useMutation({
    ...operations.expressions.updateComputedTime(),
    ...options,
  });
}
