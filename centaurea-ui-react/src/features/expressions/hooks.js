import { useMutation, useQuery } from '@tanstack/react-query';
import { useApi } from '../../providers';

/**

 * Hook for calculating an expression
 * @returns {Object} Mutation object with mutate, mutateAsync, isPending, error, data
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
 * @param {number} [limit=100] - Maximum number of history items to fetch
 * @param {Object} [options] - Additional react-query options
 * @returns {Object} Query object with data, isLoading, error, refetch
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
 * @returns {Object} Mutation object with mutate, mutateAsync, isPending, error
 * 
 * @example
 * const { mutate: clearHistory, isPending } = useClearHistory();
 * 
 * const handleClear = () => {
 *   clearHistory();
 * };
 */
export function useClearHistory() {
  const { operations } = useApi();

  // @ts-ignore - operations.expressions.clearHistory() returns properly typed mutation config
  return useMutation(operations.expressions.clearHistory());
}

/**
 * Hook for updating computed time of a history item
 * @returns {Object} Mutation object with mutate, mutateAsync, isPending, error
 * 
 * @example
 * const { mutate: updateComputedTime, isPending } = useUpdateComputedTime();
 * 
 * const handleUpdate = (historyId, newTime) => {
 *   updateComputedTime({ 
 *     id: historyId, 
 *     computedTime: newTime.toISOString() 
 *   });
 * };
 */
export function useUpdateComputedTime() {
  const { operations } = useApi();

  // @ts-ignore - operations.expressions.updateComputedTime() returns properly typed mutation config
  return useMutation(operations.expressions.updateComputedTime());
}

/**
 * Hook for fetching sample expressions
 * @param {Object} [options] - Additional react-query options
 * @returns {Object} Query object with data, isLoading, error, refetch
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
