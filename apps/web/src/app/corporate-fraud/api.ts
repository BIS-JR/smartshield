import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { StatusCounts } from '@/lib/useModules';
import type { TimeRange } from '@/components/module-pattern/TimeRangeFilter';
import type { GraphNode, GraphEdge } from './NetworkGraph';

export interface CorporateEntity {
  id: string;
  entityNumber: string;
  title: string;
  docNumber: string | null;
  category: string;
  severity: string;
  status: string;
  layersCount: number;
  uboIdentified: boolean;
  uboName: string | null;
  confidenceScore: string;
  decidedAt: string | null;
  createdAt: string;
}

interface ListResponse {
  items: CorporateEntity[];
  total: number;
  page: number;
  pageSize: number;
  counts: StatusCounts;
}

export function useCorporateFraudList(range: TimeRange, page: number, pageSize: number) {
  return useQuery({
    queryKey: ['corporate-fraud', 'list', range, page, pageSize],
    queryFn: async () => {
      const { data } = await api.get<ListResponse>('/corporate-fraud', { params: { range, page, pageSize } });
      return data;
    },
  });
}

export function useCorporateFraudDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['corporate-fraud', 'detail', id],
    queryFn: async () => {
      const { data } = await api.get<CorporateEntity>(`/corporate-fraud/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCorporateFraudGraph(id: string | undefined) {
  return useQuery({
    queryKey: ['corporate-fraud', 'graph', id],
    queryFn: async () => {
      const { data } = await api.get<{ nodes: GraphNode[]; edges: GraphEdge[] }>(`/corporate-fraud/${id}/graph`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCorporateFraudDecision(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (action: 'bloquear' | 'liberar') => {
      const { data } = await api.post<CorporateEntity>(`/corporate-fraud/${id}/decision`, { action });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-fraud'] });
    },
  });
}

export type ReportType = 'rede_relacionamentos' | 'nos_suspeitos' | 'casca_cebola';

export function useCorporateFraudReport(id: string) {
  return useMutation({
    mutationFn: async ({ reportType, recipientEmail }: { reportType: ReportType; recipientEmail: string }) => {
      const { data } = await api.post(`/corporate-fraud/${id}/report`, { reportType, recipientEmail });
      return data;
    },
  });
}

export function useCorporateFraudFreeze(id: string) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/corporate-fraud/${id}/freeze`);
      return data;
    },
  });
}
