/**
 * Expression API
 * 
 * API functions for expression operations
 */

/**
 * Create expression API with configured client
 * @param {ApiClient} client - Configured API client
 */
export function createExpressionApi(client) {
  return {
    /**
     * Get sample expressions
     * @returns {Promise<Array>}
     */
    async getSamples() {
      return client.get('/expression/samples');
    },

    /**
     * Calculate an expression
     * @param {number} operation - Operation type (OperationType enum)
     * @param {number|null} firstOperand - First operand (null for regexp)
     * @param {number|null} secondOperand - Second operand (null for unary/regexp)
     * @param {string} [pattern] - Regexp pattern (for OperationType.Regexp)
     * @param {string} [text] - Text to match (for OperationType.Regexp)
     * @returns {Promise<Object>}
     */
    async calculate(operation, firstOperand = null, secondOperand = null, pattern, text) {
      const body = {
        operation,
        firstOperand,
        secondOperand,
      };
      
      // Add regexp-specific parameters if provided
      if (pattern !== undefined && text !== undefined) {
        body.pattern = pattern;
        body.text = text;
      }
      
      return client.post('/expression/calculate', body);
    },

    /**
     * Get expression history
     * @param {number} limit - Maximum number of history items
     * @returns {Promise<Array>}
     */
    async getHistory(limit = 100) {
      return client.get(`/expression/history?limit=${limit}`);
    },

    /**
     * Clear expression history
     * @returns {Promise<Object>}
     */
    async clearHistory() {
      return client.delete('/expression/history');
    },

    /**
     * Update computed time for a history item
     * @param {number} id - History item ID
     * @param {string} computedTime - Computed time value
     * @returns {Promise<Object>}
     */
    async updateHistoryComputedTime(id, computedTime) {
      return client.put(`/expression/history/${id}/computed-time`, {
        computedTime,
      });
    },
  };
}
