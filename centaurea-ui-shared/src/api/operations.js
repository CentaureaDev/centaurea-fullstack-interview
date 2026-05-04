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
