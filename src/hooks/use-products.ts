'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/products.service';
import type { ProductPayload } from '@/types/database';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: unknown) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Queries
export function useProducts(categoryId?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: productKeys.list(categoryId),
    queryFn: () => productService.getAll(categoryId),
  });

  return {
    products: data?.data || [],
    loading: isLoading,
    error: error?.message || data?.error || null,
    count: data?.count || 0,
    refetch,
  };
}

export function useProduct(id: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });

  return {
    product: data?.data || null,
    loading: isLoading,
    error: error?.message || data?.error || null,
    refetch,
  };
}

// Mutations
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductPayload) => productService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductPayload }) =>
      productService.update(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
