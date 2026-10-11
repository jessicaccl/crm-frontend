import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../services/api';
import type { CustomerFilters, CustomerInput } from '../types/customer';

const KEY = 'customers';

export function useCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: [KEY, filters],
    queryFn: () => customersApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useSaveCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: CustomerInput }) =>
      id ? customersApi.update(id, data) : customersApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customersApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}
