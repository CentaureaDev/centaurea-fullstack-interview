import { createApiError, toUiError } from '../utils/utils.js';

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

    const data = await this.#parseJsonSafe(response);

    if (!response.ok) {
      throw createApiError(response.status, data, `HTTP ${response.status}`);
    }

    return data;
  }

  async #parseJsonSafe(response) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  #getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken?.();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }
}

export class ApiOperations {
  #api;
  #queryClient;

  constructor(api, queryClient) {
    this.#api = api;
    this.#queryClient = queryClient;
  }

  expressionSamples() {
    return {
      queryKey: ['expressions', 'samples'],
      queryFn: () => this.#api.getExpressionSamples(),
    };
  }

  expressionHistory(limit = 100) {
    return {
      queryKey: ['expressions', 'history', { limit }],
      queryFn: () => this.#api.getExpressionHistory(limit),
    };
  }

  calculateExpression() {
    return {
      mutationFn: ({ operation, firstOperand = null, secondOperand = null, pattern = null, text = null }) =>
        this.#api.calculateExpression(operation, firstOperand, secondOperand, pattern, text),
      onSuccess: () => this.#invalidateHistory(),
    };
  }

  clearExpressionHistory() {
    return {
      mutationFn: () => this.#api.clearExpressionHistory(),
      onSuccess: () => this.#invalidateHistory(),
    };
  }

  updateExpressionComputedTime() {
    return {
      mutationFn: ({ id, computedTime }) => this.#api.updateExpressionHistoryComputedTime(id, computedTime),
      onSuccess: () => this.#invalidateHistory(),
    };
  }

  userList() {
    return {
      queryKey: ['users', 'list'],
      queryFn: () => this.#api.getUsers(),
    };
  }

  #invalidateHistory() {
    return this.#queryClient.invalidateQueries({ queryKey: ['expressions', 'history'] });
  }
}

export const DEFAULT_QUERY_OPTIONS = {
  queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 },
};

export function createQueryErrorHandler({ onError } = {}) {
  return (error) => {
    const uiError = toUiError(error);
    if (uiError.status === 401) return;
    onError?.(uiError.message);
  };
}

export function createApiStack({ apiUrl, getToken, onUnauthorized, onForbidden, queryClient }) {
  if (!queryClient) {
    throw new Error('createApiStack requires queryClient');
  }

  const api = new ApiClient(apiUrl, getToken, onUnauthorized, onForbidden);
  const operations = new ApiOperations(api, queryClient);
  return { api, queryClient, operations };
}
