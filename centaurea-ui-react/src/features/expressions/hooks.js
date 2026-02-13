import { useMutation, useQuery } from '@tanstack/react-query';
import { useApi } from '../../providers';

/**
 * Hook for calculating an expression
 * 
 * @returns {{
 *   mutate: (variables: {operation: number, firstOperand?: number, secondOperand?: number, pattern?: string, text?: string}) => void,
 *   mutateAsync: (variables: {operation: number, firstOperand?: number, secondOperand?: number, pattern?: string, text?: string}) => Promise<any>,
 *   isPending: boolean,
 *   isError: boolean,
 *   error: Error | null,
 *   data: {result: {result: number, expressionText: string, computedTime: string}, regexpUsage?: {used: number, total: number, remaining: number}} | undefined,
 *   status: 'idle' | 'pending' | 'success' | 'error',
 *   reset: () => void
 * }} TanStack Query mutation object with:
 * - `mutate`: Function to trigger the calculation mutation
 * - `mutateAsync`: Async variant that returns a Promise
 * - `isPending`: True while the mutation is executing
 * - `isError`: True if the mutation encountered an error
 * - `error`: Error object with message and optional status/data properties
 * - `data`: Response containing calculation result and optional regexp usage info
 * - `status`: Current mutation state
 * - `reset`: Function to reset mutation state
 * 
 * @example
 * const { mutate, isPending, error, data } = useCalculate();
 * 
 * // Binary operation
 * mutate({ operation: OperationType.Addition, firstOperand: 5, secondOperand: 3 });
 * 
 * // Unary operation
 * mutate({ operation: OperationType.Factorial, firstOperand: 5 });
 * 
 * // Regexp operation
 * mutate({ operation: OperationType.Regexp, pattern: '\\d+', text: 'abc123' });
 */
export function useCalculate() {
  const { operations } = useApi();

  // @ts-ignore - operations.expressions.calculate() returns properly typed mutation config
  return useMutation(operations.expressions.calculate());
}

/**
 * Hook for fetching expression history
 * 
 * @param {number} [limit=100] - Maximum number of history items to fetch
 * @param {Object} [options] - Additional react-query options
 * @returns {{
 *   data: Array<{id: number, expression: string, result: string, createdAt: string, computedTime: string}> | undefined,
 *   isLoading: boolean,
 *   isFetching: boolean,
 *   isError: boolean,
 *   error: Error | null,
 *   refetch: () => Promise<any>,
 *   status: 'pending' | 'success' | 'error'
 * }} TanStack Query query object with:
 * - `data`: Array of expression history items (undefined while loading)
 * - `isLoading`: True on initial load
 * - `isFetching`: True whenever data is being fetched (including background refetch)
 * - `isError`: True if the query encountered an error
 * - `error`: Error object if query failed
 * - `refetch`: Function to manually trigger a refetch
 * - `status`: Current query state
 * 
 * @example
 * const { data: history, isLoading, error } = useExpressionHistory(50);
 */
export function useExpressionHistory(limit = 100, options = {}) {
  const { operations } = useApi();

  // @ts-ignore - operations.expressions.history() returns properly typed query config
  return useQuery({
    ...operations.expressions.history(limit),
    ...options,
  });
}

/**
 * Hook for clearing expression history
 * 
 * @param {Object} [options] - TanStack Query mutation options
 * @param {Function} [options.onSuccess] - Callback called on successful mutation: (data) => void
 * @param {Function} [options.onError] - Callback called on mutation error: (error) => void
 * @param {Function} [options.onSettled] - Callback called when mutation settles: (data, error) => void
 * @returns {{
 *   mutate: () => void,
 *   mutateAsync: () => Promise<void>,
 *   isPending: boolean,
 *   isError: boolean,
 *   error: Error | null,
 *   status: 'idle' | 'pending' | 'success' | 'error',
 *   reset: () => void
 * }} TanStack Query mutation object with:
 * - `mutate`: Function to trigger the clear history mutation
 * - `mutateAsync`: Async variant that returns a Promise
 * - `isPending`: True while the mutation is executing
 * - `isError`: True if the mutation encountered an error
 * - `error`: Error object if mutation failed
 * - `status`: Current mutation state
 * - `reset`: Function to reset mutation state
 * 
 * @example
 * const { mutate: clearHistory, isPending } = useClearHistory({
 *   onSuccess: () => setToastMessage('History cleared.'),
 *   onError: (error) => console.error('Failed to clear history', error)
 * });
 * 
 * const handleClear = () => {
 *   clearHistory();
 * };
 */
export function useClearHistory(options = {}) {
  const { operations } = useApi();

  // @ts-ignore - operations.expressions.clearHistory() returns properly typed mutation config
  return useMutation({
    ...operations.expressions.clearHistory(),
    ...options,
  });
}

/**
 * Hook for updating computed time of a history item
 * 
 * @param {Object} [options] - TanStack Query mutation options
 * @param {Function} [options.onSuccess] - Callback called on successful mutation: (data) => void
 * @param {Function} [options.onError] - Callback called on mutation error: (error) => void
 * @param {Function} [options.onSettled] - Callback called when mutation settles: (data, error) => void
 * @returns {{
 *   mutate: (variables: {id: number, computedTime: string}) => void,
 *   mutateAsync: (variables: {id: number, computedTime: string}) => Promise<void>,
 *   isPending: boolean,
 *   isError: boolean,
 *   error: Error | null,
 *   status: 'idle' | 'pending' | 'success' | 'error',
 *   reset: () => void
 * }} TanStack Query mutation object with:
 * - `mutate`: Function to trigger the update mutation (pass {id, computedTime})
 * - `mutateAsync`: Async variant that returns a Promise
 * - `isPending`: True while the mutation is executing
 * - `isError`: True if the mutation encountered an error
 * - `error`: Error object if mutation failed
 * - `status`: Current mutation state
 * - `reset`: Function to reset mutation state
 * 
 * @example
 * const { mutate: updateComputedTime, isPending } = useUpdateComputedTime({
 *   onSuccess: () => setToastMessage('Computed time updated.'),
 *   onError: (error) => console.error('Failed to update', error)
 * });
 * 
 * const handleUpdate = (historyId, newTime) => {
 *   updateComputedTime({ 
 *     id: historyId, 
 *     computedTime: newTime.toISOString() 
 *   });
 * };
 */
export function useUpdateComputedTime(options = {}) {
  const { operations } = useApi();

  // @ts-ignore - operations.expressions.updateComputedTime() returns properly typed mutation config
  return useMutation({
    ...operations.expressions.updateComputedTime(),
    ...options,
  });
}

/**
 * Hook for fetching sample expressions
 * 
 * @param {Object} [options] - Additional react-query options
 * @returns {{
 *   data: Array<{id: number, name: string, operation: number, firstOperand: number, secondOperand: number, pattern: string, text: string}> | undefined,
 *   isLoading: boolean,
 *   isFetching: boolean,
 *   isError: boolean,
 *   error: Error | null,
 *   refetch: () => Promise<any>,
 *   status: 'pending' | 'success' | 'error'
 * }} TanStack Query query object with:
 * - `data`: Array of sample expression objects (undefined while loading)
 * - `isLoading`: True on initial load
 * - `isFetching`: True whenever data is being fetched
 * - `isError`: True if the query encountered an error
 * - `error`: Error object if query failed
 * - `refetch`: Function to manually trigger a refetch
 * - `status`: Current query state
 * 
 * @example
 * const { data: samples, isLoading } = useSamples();
 */
export function useSamples(options = {}) {
  const { operations } = useApi();

  // @ts-ignore - operations.expressions.samples() returns properly typed query config
  return useQuery({
    ...operations.expressions.samples(),
    ...options,
  });
}
