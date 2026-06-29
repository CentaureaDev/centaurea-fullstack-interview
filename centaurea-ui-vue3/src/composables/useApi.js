import { ApiKey } from '@/providers/keys';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { inject } from 'vue';

export function useApi() {
  const stack = inject(ApiKey);
  if (!stack) {
    throw new Error('useApi() requires provideApi() in main.js');
  }

  return stack.operations;
}

export function useCalculate() {
  const operations = useApi();
  return useMutation(operations.calculateExpression());
}

export function useExpressionHistory(limit = 100) {
  const operations = useApi();
  return useQuery(operations.expressionHistory(limit));
}

export function useExpressionSamples() {
  const operations = useApi();
  return useQuery(operations.expressionSamples());
}

export function useClearHistory() {
  const operations = useApi();
  return useMutation(operations.clearExpressionHistory());
}

export function useUserList() {
  const operations = useApi();
  return useQuery(operations.userList());
}

export function useUpdateComputedTime() {
  const operations = useApi();
  return useMutation(operations.updateExpressionComputedTime());
}
