import { useMutation } from '@tanstack/vue-query';
import { useApi } from '../../plugins/apiPlugin.js';

export function useUpdateComputedTime(options = {}) {
  const { operations } = useApi();
  return useMutation({ ...operations.updateExpressionComputedTime(), ...options });
}
