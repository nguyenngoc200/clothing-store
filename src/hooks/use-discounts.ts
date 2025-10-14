'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { discountService } from '@/services/discounts.service';
import type { DiscountPayload } from '@/types/database';

// Query keys
export const discountKeys = {
  all: ['discounts'] as const,
  lists: () => [...discountKeys.all, 'list'] as const,
  list: (filters?: unknown) => [...discountKeys.lists(), { filters }] as const,
  details: () => [...discountKeys.all, 'detail'] as const,
  detail: (id: string) => [...discountKeys.details(), id] as const,
};

// Queries
export function useDiscounts() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: discountKeys.lists(),
    queryFn: discountService.getAll,
  });

  return {
    discounts: data?.data || [],
    loading: isLoading,
    error: error?.message || data?.error || null,
    count: data?.count || 0,
    refetch,
  };
}

export function useDiscount(id: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: discountKeys.detail(id),
    queryFn: () => discountService.getById(id),
    enabled: !!id,
  });

  return {
    discount: data?.data || null,
    loading: isLoading,
    error: error?.message || data?.error || null,
    refetch,
  };
}

// Mutations
export function useCreateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DiscountPayload) => discountService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
    },
  });
}

export function useUpdateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DiscountPayload }) =>
      discountService.update(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: discountKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
    },
  });
}

export function useDeleteDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discountService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
    },
  });
}
