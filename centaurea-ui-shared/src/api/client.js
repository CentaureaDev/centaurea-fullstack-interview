export { ApiOperations } from './operations.js';
export { BinaryOperations, OperationNames, OperationSymbols, OperationType, RegexpOperation, UnaryOperations } from './operationTypes.js';

export class ApiClient {
  constructor(apiUrl, getToken, onUnauthorized, onForbidden) {
    this.apiUrl = apiUrl;
    this.getToken = getToken;
    this.onUnauthorized = onUnauthorized;
    this.onForbidden = onForbidden;
  }

  getExpressionSamples() { return this.#get('/expression/samples'); }

  calculateExpression(operation, firstOperand = null, secondOperand = null, pattern = null, text = null) {
    const isRegexp = pattern !== null && text !== null;
    const body = {
      operation,
      firstOperand: isRegexp ? 0 : firstOperand,
      secondOperand: isRegexp ? 0 : secondOperand,
      ...(isRegexp && { pattern, text }),
    };
    return this.#post('/expression/calculate', body);
  }

  getExpressionHistory(limit = 100) { return this.#get(`/expression/history?limit=${limit}`); }

  clearExpressionHistory() { return this.#delete('/expression/history'); }

  updateExpressionHistoryComputedTime(id, computedTime) {
    return this.#put(`/expression/history/${id}/computed-time`, { computedTime });
  }

  getUsers() { return this.#get('/admin/users'); }

  #get(endpoint) { return this.#request(endpoint, { method: 'GET' }); }

  #post(endpoint, body) { return this.#request(endpoint, { method: 'POST', body: JSON.stringify(body) }); }

  #put(endpoint, body) { return this.#request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); }

  #delete(endpoint) { return this.#request(endpoint, { method: 'DELETE' }); }

  async #request(endpoint, options = {}) {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: { ...this.#getHeaders(), ...options.headers },
    });

    if (response.status === 401) this.onUnauthorized?.();
    if (response.status === 403) this.onForbidden?.();

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      if (data.title && data.errors) {
        const msgs = Object.entries(data.errors).flatMap(([field, messages]) =>
          Array.isArray(messages) ? messages.map(m => `${field}: ${m}`) : []
        );
        errorMessage = data.title + '\n' + msgs.join('\n');
      } else if (data.error) {
        errorMessage = data.error;
      } else if (data.title) {
        errorMessage = data.title;
      } else if (data.message) {
        errorMessage = data.message;
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  #getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken?.();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }
}
