// @ts-check
/**
 * Expression API
 * 
 * API functions for expression operations
 */

/**
 * Create expression API with configured client
 * @param {import('../apiClient').ApiClient} client - Configured API client
 * @returns {import('../index').ExpressionApi}
 */
export function createExpressionApi(client) {
  return {
    /**
     * Get sample expressions
     * @returns {Promise<import('../index').ExpressionSample[]>}
     */
    async getSamples() {
      return client.get('/expression/samples');
    },

    /**
     * Calculate an expression
     * @param {number} operation - Operation type (OperationType enum)
     * @param {number|null} firstOperand - First operand (null for regexp, defaults to null)
     * @param {number|null} secondOperand - Second operand (null for unary/regexp, defaults to null)
     * @param {string|null} pattern - Regexp pattern (for OperationType.Regexp, defaults to null)
     * @param {string|null} text - Text to match (for OperationType.Regexp, defaults to null)
     * @returns {Promise<import('../index').CalculateResult>}
     */
    async calculate(operation, firstOperand = null, secondOperand = null, pattern = null, text = null) {
      const body = {
        operation,
        firstOperand,
        secondOperand,
      };
      
      // Add regexp-specific parameters if provided
      if (pattern !== null && text !== null) {
        /** @type {any} */
        const anyBody = body;
        anyBody.pattern = pattern;
        anyBody.text = text;
      }
      
      return client.post('/expression/calculate', body);
    },

    /**
     * Get expression history
     * @param {number} [limit=100] - Maximum number of history items
     * @returns {Promise<import('../index').ExpressionHistory[]>}
     */
    async getHistory(limit = 100) {
      return client.get(`/expression/history?limit=${limit}`);
    },

    /**
     * Clear expression history
     * @returns {Promise<void>}
     */
    async clearHistory() {
      return client.delete('/expression/history');
    },

    /**
     * Update computed time for a history item
     * @param {number} id - History item ID
     * @param {string} computedTime - Computed time value
     * @returns {Promise<void>}
     */
    async updateHistoryComputedTime(id, computedTime) {
      return client.put(`/expression/history/${id}/computed-time`, {
        computedTime,
      });
    },
  };
}
