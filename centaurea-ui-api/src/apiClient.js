/**
 * API Client
 * 
 * Core API client for making requests with token injection and error handling
 */

export class ApiClient {
  /**
   * @param {string} apiUrl - Base API URL
   * @param {function(): string|null} getToken - Function to retrieve auth token
   * @param {function(): void} onUnauthorized - Callback when request returns 401
   * @param {function(): void} onForbidden - Callback when request returns 403
   */
  constructor(apiUrl, getToken, onUnauthorized, onForbidden) {
    this.apiUrl = apiUrl;
    this.getToken = getToken;
    this.onUnauthorized = onUnauthorized;
    this.onForbidden = onForbidden;
  }

  /**
   * Get request headers with auth token
   * @returns {Object}
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
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<any>}
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
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}
