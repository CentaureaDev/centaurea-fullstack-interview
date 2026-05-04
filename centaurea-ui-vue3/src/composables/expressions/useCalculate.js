import { useMutation } from '@tanstack/vue-query';
import { useApi } from '../../plugins/apiPlugin.js';

export function useCalculate() {
  const { operations } = useApi();
  return useMutation(operations.calculateExpression());
}
