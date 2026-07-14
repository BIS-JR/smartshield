import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface BlockDto {
  id: string;
  code: string;
  title: string;
  description: string | null;
  severity: string;
  status: 'ativo' | 'em_analise' | 'liberado';
  sourceRecordType: string;
  sourceModule: { key: string; name: string; color: string; icon: string } | null;
  createdAt: string;
}

export interface BriefingDto {
  id: string;
  blockId: string;
  whyBlocked: string;
  evidence: string[];
  history: string[];
  connections: string[];
  decisionExplanation: string;
  recommendation: string;
}

export interface MessageDto {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  messageType: string;
  createdAt: string;
}

export function useBlocks() {
  return useQuery({
    queryKey: ['investigation', 'blocks'],
    queryFn: async () => (await api.get<BlockDto[]>('/investigation/blocks')).data,
  });
}

export function useBriefing(blockId: string | undefined) {
  return useQuery({
    queryKey: ['investigation', 'briefing', blockId],
    queryFn: async () => (await api.get<BriefingDto>(`/investigation/blocks/${blockId}/briefing`)).data,
    enabled: Boolean(blockId),
  });
}

export function useMessages(blockId: string | undefined) {
  return useQuery({
    queryKey: ['investigation', 'messages', blockId],
    queryFn: async () => (await api.get<MessageDto[]>(`/investigation/blocks/${blockId}/messages`)).data,
    enabled: Boolean(blockId),
  });
}

export function useAskQuestion(blockId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (question: string) => (await api.post<MessageDto>(`/investigation/blocks/${blockId}/ask`, { question })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investigation', 'messages', blockId] });
    },
  });
}

export function useUnblock(blockId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post<BlockDto>(`/investigation/blocks/${blockId}/unblock`, {})).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investigation', 'blocks'] });
    },
  });
}
