import { useMutation } from '@tanstack/vue-query';
import { useApi } from '../../plugins/apiPlugin.js';

export function useClearHistory(options = {}) {
  const { operations } = useApi();
  return useMutation({ ...operations.clearExpressionHistory(), ...options });
}
