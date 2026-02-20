import { useMutation } from '@tanstack/vue-query';
import { useApi } from '../../plugins/apiPlugin.js';

/**
 * Composable for calculating an expression.
 *
 * @returns TanStack mutation with mutate, isPending, error, data
 *
 * @example
 * const { mutate, isPending, error, data } = useCalculate();
 * // Binary
 * mutate({ operation: OperationType.Addition, firstOperand: 5, secondOperand: 3 });
 * // Unary
 * mutate({ operation: OperationType.Factorial, firstOperand: 5 });
 * // Regexp
 * mutate({ operation: OperationType.Regexp, pattern: '\\d+', text: 'abc123' });
 */
export function useCalculate() {
  const { operations } = useApi();
  return useMutation(operations.expressions.calculate());
}
