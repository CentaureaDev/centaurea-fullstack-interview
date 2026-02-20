// @ts-check
/**
 * @typedef {Object} ExpressionHistory
 * @property {number} id
 * @property {number} operation
 * @property {number|null} firstOperand
 * @property {number|null} secondOperand
 * @property {number|null} result
 * @property {string} computedTime - ISO 8601 datetime
 * @property {string|null} pattern - Regex pattern
 * @property {string|null} text - Text for regex matching
 */

/**
 * @typedef {Object} ExpressionSample
 * @property {number} operation
 * @property {number|null} firstOperand
 * @property {number|null} secondOperand
 * @property {string|null} pattern
 * @property {string|null} text
 */

/**
 * @typedef {Object} CalculateResult
 * @property {number|string} result
 * @property {number} operation
 * @property {number|null} firstOperand
 * @property {number|null} secondOperand
 * @property {string|null} pattern
 * @property {string|null} text
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} email
 * @property {boolean} isAdmin
 * @property {string} createdAt
 */

/**
 * @typedef {Object} ExpressionApi
 * @property {(limit?: number) => Promise<ExpressionHistory[]>} getHistory
 * @property {() => Promise<ExpressionSample[]>} getSamples
 * @property {(operation: number, firstOperand: number|null, secondOperand: number|null, pattern: string|null, text: string|null) => Promise<CalculateResult>} calculate
 * @property {() => Promise<void>} clearHistory
 * @property {(id: number, computedTime: string) => Promise<void>} updateHistoryComputedTime
 */

/**
 * @typedef {Object} UserApi
 * @property {() => Promise<User[]>} getUsers
 */

import { ApiClient } from './apiClient.js';
import {
    createExpressionApi,
    createExpressionMutations,
    createExpressionQueries,
    expressionKeys,
} from './expressions/index.js';
import {
    BinaryOperations,
    OperationNames,
    OperationSymbols,
    OperationType,
    RegexpOperation,
    UnaryOperations,
} from './operationTypes.js';
import {
    createUserApi,
    createUserQueries,
    userKeys,
} from './users/index.js';

export { ApiClient, BinaryOperations, createExpressionApi, createExpressionMutations, createExpressionQueries, createUserApi, createUserQueries, expressionKeys, OperationNames, OperationSymbols, OperationType, RegexpOperation, UnaryOperations, userKeys };

/**
 * @typedef {Object} QueryKeyFactory
 * @property {() => string[]} all - Get all query keys
 */

/**
 * @typedef {Object} ExpressionQueryKeys
 * @property {string[]} all
 * @property {() => string[]} samples
 * @property {(limit?: number) => (string|Object)[]} history
 */

/**
 * @typedef {Object} UserQueryKeys
 * @property {string[]} all
 * @property {() => string[]} list
 */

/**
 * @typedef {Object} CalculateParams
 * @property {number} operation - Operation type (0=Add, 1=Subtract, etc.)
 * @property {number|null} [firstOperand] - First operand
 * @property {number|null} [secondOperand] - Second operand
 * @property {string|null} [pattern] - Regex pattern
 * @property {string|null} [text] - Text to match
 */

/**
 * @typedef {Object} UpdateComputedTimeParams
 * @property {number} id
 * @property {string} computedTime
 */

/**
 * @typedef {Object.<string, *>} ExpressionOperations
 */

/**
 * @typedef {Object.<string, *>} UserOperations
 */

/**
 * @typedef {Object} Operations
 * @property {ExpressionOperations} expressions
 * @property {UserOperations} users
 */

/**
 * Create TanStack Query operations grouped by feature
 * @param {{client: import('./apiClient').ApiClient, expression: ExpressionApi, user: UserApi}} api - API instance
 * @param {Object} queryClient - TanStack Query client
 * @returns {Operations} Operations grouped by feature with keys included
 */
export function createOperations(api, queryClient) {
  const expressionQueries = createExpressionQueries(api.expression);
  const expressionMutations = createExpressionMutations(api.expression, queryClient);
  const userQueries = createUserQueries(api.user);

  /** @type {Operations} */
  const operations = {
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
  
  return operations;
}