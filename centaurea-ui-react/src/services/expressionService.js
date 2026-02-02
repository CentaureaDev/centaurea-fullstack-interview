const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5034/api';

export const expressionService = {
  async getSamples() {
    const response = await fetch(`${API_URL}/expression/samples`);
    if (!response.ok) throw new Error('Failed to fetch sample expressions');
    return response.json();
  },

  async calculate(operation, firstOperand, secondOperand) {
    const response = await fetch(`${API_URL}/expression/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    const response = await fetch(`${API_URL}/expression/history?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  async clearHistory() {
    const response = await fetch(`${API_URL}/expression/history`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to clear history');
    return response.json();
  },
};

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
