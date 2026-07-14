import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface RuleDto {
  id: string;
  name: string;
  description: string | null;
  conditionExpression: string;
  threshold: string | null;
  outputSeverity: string;
  action: string;
  isActive: boolean;
  module: { key: string; name: string; color: string };
}

export interface RuleFormInput {
  name: string;
  moduleKey: string;
  description?: string;
  conditionExpression: string;
  threshold?: number;
  outputSeverity: string;
  action: string;
}

export function useRules(moduleKey: string) {
  return useQuery({
    queryKey: ['rules-engine', moduleKey],
    queryFn: async () => (await api.get<RuleDto[]>('/rules-engine', { params: { module: moduleKey } })).data,
  });
}

export function useCreateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RuleFormInput) => (await api.post<RuleDto>('/rules-engine', input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rules-engine'] }),
  });
}

export function useUpdateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: RuleFormInput }) => (await api.patch<RuleDto>(`/rules-engine/${id}`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rules-engine'] }),
  });
}

export function useSetRuleActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await api.patch<RuleDto>(`/rules-engine/${id}/active`, { isActive })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rules-engine'] }),
  });
}

export function useDeleteRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/rules-engine/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rules-engine'] }),
  });
}

export interface TestResult {
  evaluated: number;
  matched: number;
  sampleMatches: { id: string; label: string; matched: boolean }[];
}

export function useTestRule() {
  return useMutation({
    mutationFn: async (id: string) => (await api.post<TestResult>(`/rules-engine/${id}/test`)).data,
  });
}
