'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/orders.service';
import { productKeys } from '@/hooks/use-products';
import type { OrderPayload } from '@/types/database';

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters?: unknown) => [...orderKeys.lists(), { filters }] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

// Queries
export function useOrders() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: orderKeys.lists(),
    queryFn: () => orderService.getAll(),
  });

  return {
    orders: data?.data || [],
    loading: isLoading,
    error: error?.message || data?.error || null,
    count: data?.count || 0,
    refetch,
  };
}

export function useOrder(id: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });

  return {
    order: data?.data || null,
    loading: isLoading,
    error: error?.message || data?.error || null,
    refetch,
  };
}

// Mutations
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OrderPayload) => orderService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      // Also refresh products so status changes from order creation are visible immediately
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: OrderPayload }) =>
      orderService.update(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      // Ensure products list is refreshed when an order update changes product statuses
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
