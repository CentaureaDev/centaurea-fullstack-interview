// @ts-check
/**
 * API Client
 * 
 * Core API client for making requests with token injection and error handling
 */

/**
 * @typedef {Object} RequestOptions
 * @property {string} [method] - HTTP method
 * @property {string} [body] - Request body
 * @property {Object} [headers] - Request headers
 */

/**
 * @typedef {Object} ApiError
 * @property {string} message - Error message
 * @property {number} [status] - HTTP status code
 * @property {any} [data] - Error response data
 */

export class ApiClient {
  /**
   * @param {string} apiUrl - Base API URL
   * @param {() => (string|null)} getToken - Function to retrieve auth token
   * @param {() => void} onUnauthorized - Callback when request returns 401
   * @param {() => void} onForbidden - Callback when request returns 403
   */
  constructor(apiUrl, getToken, onUnauthorized, onForbidden) {
    this.apiUrl = apiUrl;
    this.getToken = getToken;
    this.onUnauthorized = onUnauthorized;
    this.onForbidden = onForbidden;
  }

  /**
   * Get request headers with auth token
   * @returns {Object<string, string>}
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    const token = this.getToken?.();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Make API request
   * @template T
   * @param {string} endpoint - API endpoint
   * @param {RequestOptions} [options={}] - Fetch options
   * @returns {Promise<T>}
   * @throws {ApiError} On HTTP error status codes
   */
  async request(endpoint, options = {}) {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    // Handle unauthorized
    if (response.status === 401) {
      this.onUnauthorized?.();
    }

    // Handle forbidden (lack of permission)
    if (response.status === 403) {
      this.onForbidden?.();
    }

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  /**
   * GET request
   * @template T
   * @param {string} endpoint - API endpoint
   * @returns {Promise<T>}
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   * @template T
   * @param {string} endpoint - API endpoint
   * @param {any} [body] - Request body
   * @returns {Promise<T>}
   */
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   * @template T
   * @param {string} endpoint - API endpoint
   * @param {any} [body] - Request body
   * @returns {Promise<T>}
   */
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   * @template T
   * @param {string} endpoint - API endpoint
   * @returns {Promise<T>}
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}
