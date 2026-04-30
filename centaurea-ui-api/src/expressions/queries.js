// @ts-check
/**
 * Expression Queries
 * 
 * TanStack Query configurations for expression queries
 */

import { expressionKeys } from './keys.js';

/**
 * Create expression query configurations
 * @param {import('../index').ExpressionApi} expressionApi - Expression API instance
 * @returns {Object} Query configurations
 */
export function createExpressionQueries(expressionApi) {
  return {
    /**
     * Get samples query config
     */
    samples: () => ({
      queryKey: expressionKeys.samples(),
      queryFn: () => expressionApi.getSamples(),
    }),

    /**
     * Get history query config
     */
    history: (limit = 100) => ({
      queryKey: expressionKeys.history(limit),
      queryFn: () => expressionApi.getHistory(limit),
    }),
  };
}
