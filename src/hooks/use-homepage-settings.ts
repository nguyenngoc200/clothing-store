'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { homepageService } from '@/services/homepage.service';
import type { HomepageApiPayload } from '@/types/homepage';
import type { HomepageSettingRow } from '@/types/settings';

export const homepageKeys = {
  all: ['settings', 'homepage'] as const,
  list: () => [...homepageKeys.all, 'list'] as const,
  detail: () => [...homepageKeys.all, 'detail'] as const,
};

export function useHomepageSettings() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: homepageKeys.list(),
    queryFn: () => homepageService.getAll(),
  });

  return {
    rows: (data?.data as HomepageSettingRow[]) || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

export function useUpsertHomepage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: HomepageApiPayload) => homepageService.upsert(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: homepageKeys.list() }),
  });
}

export function useDeleteHomepage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => homepageService.delete(key),
    onSuccess: () => qc.invalidateQueries({ queryKey: homepageKeys.list() }),
  });
}
