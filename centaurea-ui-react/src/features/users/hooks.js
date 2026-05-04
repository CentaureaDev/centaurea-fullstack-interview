import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../providers';

export function useUsers(options = {}) {
  const { operations } = useApi();
  return useQuery({ ...operations.userList(), ...options });
}
