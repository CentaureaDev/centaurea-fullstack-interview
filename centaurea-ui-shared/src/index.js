export const OperationType = {
  Addition: 0,
  Subtraction: 1,
  Multiplication: 2,
  Division: 3,
  Regexp: 4,
  Factorial: 5,
  Square: 6,
  SquareRoot: 7,
  Negate: 8,
};

// Helper function for safe error handling
const parseErrorResponse = async (response) => {
  try {
    const error = await response.json();
    return {
      message: error.error || `HTTP ${response.status}: ${response.statusText}`,
      status: response.status,
    };
  } catch {
    // If JSON parsing fails, return status-based message
    if (response.status === 401) {
      return {
        message: 'Unauthorized. Please sign in again.',
        status: 401,
      };
    }
    if (response.status === 403) {
      return {
        message: 'Access denied.',
        status: 403,
      };
    }
    if (response.status === 404) {
      return {
        message: 'Resource not found.',
        status: 404,
      };
    }
    return {
      message: `HTTP ${response.status}: ${response.statusText}`,
      status: response.status,
    };
  }
};

export const OperationSymbols = {
  [OperationType.Addition]: '+',
  [OperationType.Subtraction]: '-',
  [OperationType.Multiplication]: '*',
  [OperationType.Division]: '/',
  [OperationType.Regexp]: '~',
  [OperationType.Factorial]: '!',
  [OperationType.Square]: '²',
  [OperationType.SquareRoot]: '√',
  [OperationType.Negate]: '-',
};

export const OperationNames = {
  [OperationType.Addition]: 'Addition',
  [OperationType.Subtraction]: 'Subtraction',
  [OperationType.Multiplication]: 'Multiplication',
  [OperationType.Division]: 'Division',
  [OperationType.Regexp]: 'Regexp',
  [OperationType.Factorial]: 'Factorial',
  [OperationType.Square]: 'Square',
  [OperationType.SquareRoot]: 'Square Root',
  [OperationType.Negate]: 'Negate',
};

export const UnaryOperations = [
  OperationType.Factorial,
  OperationType.Square,
  OperationType.SquareRoot,
  OperationType.Negate,
];

export const BinaryOperations = [
  OperationType.Addition,
  OperationType.Subtraction,
  OperationType.Multiplication,
  OperationType.Division,
];

export const RegexpOperation = OperationType.Regexp;

export const createAuthService = (apiUrl, storage = localStorage) => {
  const tokenKey = 'authToken';
  const userKey = 'authUser';

  return {
    getToken() {
      return storage.getItem(tokenKey);
    },

    getUser() {
      const value = storage.getItem(userKey);
      return value ? JSON.parse(value) : null;
    },

    setAuth(token, user) {
      storage.setItem(tokenKey, token);
      storage.setItem(userKey, JSON.stringify(user));
    },

    clearAuth() {
      storage.removeItem(tokenKey);
      storage.removeItem(userKey);
    },

    signOut() {
      this.clearAuth();
    },

    async register(name, email, password) {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await parseErrorResponse(response);
        const err = new Error(error.message);
        err.status = error.status;
        throw err;
      }

      return response.json();
    },

    async login(email, password) {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await parseErrorResponse(response);
        const err = new Error(error.message);
        err.status = error.status;
        throw err;
      }

      return response.json();
    },

    async signIn(email, password) {
      const response = await this.login(email, password);
      this.setAuth(response.token, response.user);
      return response.user;
    },
  };
};

export const createExpressionService = (apiUrl, getToken) => {
  const getAuthHeaders = () => {
    const token = getToken?.();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    async getSamples() {
      const response = await fetch(`${apiUrl}/expression/samples`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        const error = await parseErrorResponse(response);
        const err = new Error(error.message);
        err.status = error.status;
        throw err;
      }
      return response.json();
    },

    async calculate(operation, firstOperand, secondOperand, pattern, text) {
      const body = {
        operation,
        firstOperand,
        secondOperand,
      };
      
      // Add regexp-specific parameters if this is a regexp operation
      if (operation === OperationType.Regexp) {
        body.pattern = pattern;
        body.text = text;
      }
      
      const response = await fetch(`${apiUrl}/expression/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const error = await parseErrorResponse(response);
        const err = new Error(error.message);
        err.status = error.status;
        throw err;
      }
      return response.json();
    },

    async getHistory(limit = 100) {
      const response = await fetch(`${apiUrl}/expression/history?limit=${limit}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        const error = await parseErrorResponse(response);
        const err = new Error(error.message);
        err.status = error.status;
        throw err;
      }
      return response.json();
    },

    async clearHistory() {
      const response = await fetch(`${apiUrl}/expression/history`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        const error = await parseErrorResponse(response);
        const err = new Error(error.message);
        err.status = error.status;
        throw err;
      }
      return response.json();
    },

    async updateHistoryComputedTime(id, computedTime) {
      const response = await fetch(`${apiUrl}/expression/history/${id}/computed-time`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ computedTime }),
      });
      if (!response.ok) {
        const error = await parseErrorResponse(response);
        const err = new Error(error.message);
        err.status = error.status;
        throw err;
      }
      return response.json();
    },
  };
};

export const createAdminService = (apiUrl, getToken) => {
  const getAuthHeaders = () => {
    const token = getToken?.();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    async getUsers() {
      const response = await fetch(`${apiUrl}/admin/users`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        const error = await parseErrorResponse(response);
        const err = new Error(error.message);
        err.status = error.status;
        throw err;
      }
      return response.json();
    },
  };
};

export { AppStore } from './appStore.js';
