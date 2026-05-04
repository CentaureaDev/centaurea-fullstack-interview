import { useQuery } from '@tanstack/vue-query';
import { useApi } from '../../plugins/apiPlugin.js';

export function useSamples(options = {}) {
  const { operations } = useApi();
  return useQuery({ ...operations.expressionSamples(), ...options });
}
