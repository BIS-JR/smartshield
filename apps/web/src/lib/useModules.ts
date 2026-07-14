import { useQuery } from '@tanstack/react-query';
import { api } from './api';

export interface ModuleDto {
  id: string;
  key: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  sortOrder: number;
}

export function useModules() {
  return useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data } = await api.get<ModuleDto[]>('/modules');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export interface StatusCounts {
  aprovado: number;
  rejeitado: number;
  aguardando: number;
}

export interface DashboardSummary {
  document_ai: StatusCounts;
  corporate_fraud: StatusCounts;
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const { data } = await api.get<DashboardSummary>('/dashboard/summary');
      return data;
    },
  });
}
