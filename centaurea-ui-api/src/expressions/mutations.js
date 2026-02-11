/**
 * Expression Mutations
 * 
 * TanStack Query configurations for expression mutations
 */

import { expressionKeys } from './keys.js';

/**
 * Create expression mutation configurations
 * @param {Object} expressionApi - Expression API instance
 * @param {Object} queryClient - TanStack Query client for invalidation
 */
export function createExpressionMutations(expressionApi, queryClient) {
  return {
    /**
     * Calculate expression mutation config
     * Accepts object with: { operation, firstOperand, secondOperand, pattern, text }
     */
    calculate: () => ({
      mutationFn: ({ operation, firstOperand, secondOperand, pattern, text }) => 
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
      mutationFn: ({ id, computedTime }) =>
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
