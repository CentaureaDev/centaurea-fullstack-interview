export { ApiClient } from './apiClient.js';
export {
  createExpressionApi,
  expressionKeys,
  createExpressionQueries,
  createExpressionMutations,
} from './expressions/index.js';
export {
  createUserApi,
  userKeys,
  createUserQueries,
} from './users/index.js';
export {
  OperationType,
  OperationSymbols,
  OperationNames,
  UnaryOperations,
  BinaryOperations,
  RegexpOperation,
} from './operationTypes.js';

/**
 * Create configured API instance
 * @param {string} apiUrl - Base API URL
 * @param {function(): string|null} getToken - Function to retrieve auth token
 * @param {function(): void} onUnauthorized - Callback when request returns 401
 * @param {function(): void} onForbidden - Callback when request returns 403
 */
export function createApi(apiUrl, getToken, onUnauthorized, onForbidden) {
  const client = new ApiClient(apiUrl, getToken, onUnauthorized, onForbidden);
  
  return {
    client,
    expression: createExpressionApi(client),
    user: createUserApi(client),
  };
}

/**
 * Create TanStack Query operations grouped by feature
 * @param {Object} api - API instance from createApi()
 * @param {Object} queryClient - TanStack Query client
 * @returns {Object} Operations grouped by feature with keys included
 */
export function createOperations(api, queryClient) {
  const expressionQueries = createExpressionQueries(api.expression);
  const expressionMutations = createExpressionMutations(api.expression, queryClient);
  const userQueries = createUserQueries(api.user);

  return {
    expressions: {
      ...expressionQueries,
      ...expressionMutations,
      keys: expressionKeys,
    },
    users: {
      ...userQueries,
      keys: userKeys,
    },
  };
}