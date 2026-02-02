export const OperationType = {
  Addition: 0,
  Subtraction: 1,
  Multiplication: 2,
  Division: 3,
};

export const OperationSymbols = {
  [OperationType.Addition]: '+',
  [OperationType.Subtraction]: '-',
  [OperationType.Multiplication]: '*',
  [OperationType.Division]: '/',
};

export const OperationNames = {
  [OperationType.Addition]: 'Addition',
  [OperationType.Subtraction]: 'Subtraction',
  [OperationType.Multiplication]: 'Multiplication',
  [OperationType.Division]: 'Division',
};

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

    async register(name, email, password) {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to register');
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
        const error = await response.json();
        throw new Error(error.error || 'Failed to sign in');
      }

      return response.json();
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
      if (!response.ok) throw new Error('Failed to fetch sample expressions');
      return response.json();
    },

    async calculate(operation, firstOperand, secondOperand) {
      const response = await fetch(`${apiUrl}/expression/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          operation,
          firstOperand,
          secondOperand,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to calculate expression');
      }
      return response.json();
    },

    async getHistory(limit = 100) {
      const response = await fetch(`${apiUrl}/expression/history?limit=${limit}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) throw new Error('Failed to fetch history');
      return response.json();
    },

    async clearHistory() {
      const response = await fetch(`${apiUrl}/expression/history`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) throw new Error('Failed to clear history');
      return response.json();
    },
  };
};
