import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { StatusCounts } from '@/lib/useModules';
import type { TimeRange } from '@/components/module-pattern/TimeRangeFilter';

export interface DocumentCase {
  id: string;
  caseNumber: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  requesterName: string;
  requesterEmail: string;
  requesterCpf: string;
  documentUrl: string | null;
  fraudReason: string | null;
  confidenceScore: string;
  decidedAt: string | null;
  createdAt: string;
}

interface ListResponse {
  items: DocumentCase[];
  total: number;
  page: number;
  pageSize: number;
  counts: StatusCounts;
}

export function useDocumentAiList(range: TimeRange, page: number, pageSize: number) {
  return useQuery({
    queryKey: ['document-ai', 'list', range, page, pageSize],
    queryFn: async () => {
      const { data } = await api.get<ListResponse>('/document-ai', { params: { range, page, pageSize } });
      return data;
    },
  });
}

export function useDocumentAiDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['document-ai', 'detail', id],
    queryFn: async () => {
      const { data } = await api.get<DocumentCase>(`/document-ai/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useDocumentAiDecision(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (action: 'bloquear' | 'liberar') => {
      const { data } = await api.post<DocumentCase>(`/document-ai/${id}/decision`, { action });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-ai'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}
