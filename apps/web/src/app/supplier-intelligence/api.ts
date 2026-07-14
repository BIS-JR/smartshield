import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { StatusCounts } from '@/lib/useModules';
import type { TimeRange } from '@/components/module-pattern/TimeRangeFilter';

export interface SupplierAlert {
  id: string;
  alertNumber: string;
  supplierName: string;
  supplierCnpj: string;
  category: string;
  severity: string;
  status: string;
  description: string;
  evidence: string[];
  confidenceScore: string;
  decidedAt: string | null;
  createdAt: string;
}

interface ListResponse {
  items: SupplierAlert[];
  total: number;
  page: number;
  pageSize: number;
  counts: StatusCounts;
}

export function useSupplierIntelligenceList(range: TimeRange, page: number, pageSize: number) {
  return useQuery({
    queryKey: ['supplier-intelligence', 'list', range, page, pageSize],
    queryFn: async () => {
      const { data } = await api.get<ListResponse>('/supplier-intelligence', { params: { range, page, pageSize } });
      return data;
    },
  });
}

export function useSupplierIntelligenceDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['supplier-intelligence', 'detail', id],
    queryFn: async () => {
      const { data } = await api.get<SupplierAlert>(`/supplier-intelligence/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useSupplierIntelligenceDecision(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (action: 'bloquear' | 'liberar') => {
      const { data } = await api.post<SupplierAlert>(`/supplier-intelligence/${id}/decision`, { action });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-intelligence'] });
    },
  });
}

export function useSupplierIntelligenceReport(id: string) {
  return useMutation({
    mutationFn: async (recipientEmail: string) => {
      const { data } = await api.post(`/supplier-intelligence/${id}/report`, { recipientEmail });
      return data;
    },
  });
}
