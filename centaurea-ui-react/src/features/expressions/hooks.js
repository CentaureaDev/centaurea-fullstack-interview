import { useMutation, useQuery } from '@tanstack/react-query';
import { useApi } from '../../providers';

export function useCalculate() {
  const { operations } = useApi();
  return useMutation(operations.calculateExpression());
}

export function useExpressionHistory(limit = 100, options = {}) {
  const { operations } = useApi();
  return useQuery({ ...operations.expressionHistory(limit), ...options });
}

export function useClearHistory(options = {}) {
  const { operations } = useApi();
  return useMutation({ ...operations.clearExpressionHistory(), ...options });
}

export function useUpdateComputedTime(options = {}) {
  const { operations } = useApi();
  return useMutation({ ...operations.updateExpressionComputedTime(), ...options });
}

export function useSamples(options = {}) {
  const { operations } = useApi();
  return useQuery({ ...operations.expressionSamples(), ...options });
}
