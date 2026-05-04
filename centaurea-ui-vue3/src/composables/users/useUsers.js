import { useQuery } from '@tanstack/vue-query';
import { useApi } from '../../plugins/apiPlugin.js';

export function useUsers(options = {}) {
  const { operations } = useApi();
  return useQuery({ ...operations.userList(), ...options });
}
