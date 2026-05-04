import { useQuery } from '@tanstack/vue-query';
import { useApi } from '../../plugins/apiPlugin.js';

export function useExpressionHistory(limit = 100, options = {}) {
  const { operations } = useApi();
  return useQuery({ ...operations.expressionHistory(limit), ...options });
}
