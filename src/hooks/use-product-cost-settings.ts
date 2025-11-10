'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productCostService } from '@/services/productCost.service';
import type { ProductCostSettingRow } from '@/types/settings';

export const productCostKeys = {
  all: ['settings', 'product_cost'] as const,
  list: () => [...productCostKeys.all, 'list'] as const,
};

export function useProductCostSettings() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: productCostKeys.list(),
    queryFn: () => productCostService.getAll(),
  });

  return {
    rows: (data?.data as ProductCostSettingRow[]) || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

export function useUpsertProductCost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => productCostService.upsert(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: productCostKeys.list() }),
  });
}

export function useDeleteProductCost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => productCostService.delete(key),
    onSuccess: () => qc.invalidateQueries({ queryKey: productCostKeys.list() }),
  });
}
