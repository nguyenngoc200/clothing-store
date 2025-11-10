'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calculationService } from '@/services/calculation.service';
import type { CalculationSettingRow } from '@/types/settings';

export const calculationKeys = {
  all: ['settings', 'calculation'] as const,
  list: () => [...calculationKeys.all, 'list'] as const,
};

export function useCalculationSettings() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: calculationKeys.list(),
    queryFn: () => calculationService.getAll(),
  });

  return {
    rows: (data?.data as CalculationSettingRow[]) || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

export function useUpsertCalculation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { key: string; tab: string; data: unknown }) =>
      calculationService.upsert(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: calculationKeys.list() }),
  });
}
