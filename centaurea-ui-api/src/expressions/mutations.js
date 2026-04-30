// @ts-check
/**
 * Expression Mutations
 * 
 * TanStack Query configurations for expression mutations
 */

import { expressionKeys } from './keys.js';

/**
 * Create expression mutation configurations
 * @param {import('../index').ExpressionApi} expressionApi - Expression API instance
 * @param {any} queryClient - TanStack Query client for invalidation
 * @returns {Object} Mutation configurations
 */
export function createExpressionMutations(expressionApi, queryClient) {
  return {
    /**
     * Calculate expression mutation config
     * 
     * @example
     * // Binary operation (Addition)
     * mutate({ operation: 0, firstOperand: 5, secondOperand: 3 })
     * 
     * @example
     * // Unary operation (Factorial)
     * mutate({ operation: 5, firstOperand: 5 })
     * 
     * @example
     * // Regexp operation
     * mutate({ operation: 4, pattern: '\\d+', text: 'abc123' })
     */
    calculate: () => ({
      mutationFn: (/** @type {{operation: number, firstOperand?: number|null, secondOperand?: number|null, pattern?: string|null, text?: string|null}} */ { operation, firstOperand = null, secondOperand = null, pattern = null, text = null }) => 
        expressionApi.calculate(operation, firstOperand, secondOperand, pattern, text),
      onSuccess: () => {
        // Invalidate history after calculation
        queryClient.invalidateQueries({
          queryKey: expressionKeys.history(),
        });
      },
    }),

    /**
     * Clear history mutation config
     */
    clearHistory: () => ({
      mutationFn: () => expressionApi.clearHistory(),
      onSuccess: () => {
        // Invalidate history after clearing
        queryClient.invalidateQueries({
          queryKey: expressionKeys.history(),
        });
      },
    }),

    /**
     * Update computed time mutation config
     */
    updateComputedTime: () => ({
      mutationFn: (/** @type {{id: number, computedTime: string}} */ { id, computedTime }) =>
        expressionApi.updateHistoryComputedTime(id, computedTime),
      onSuccess: () => {
        // Invalidate history after update
        queryClient.invalidateQueries({
          queryKey: expressionKeys.history(),
        });
      },
    }),
  };
}
