import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface PaymentSummary {
  transactionsToday: number;
  blocked: number;
  suspicious: number;
  activeAutomations: number;
  byType: { pix: number; ted: number; doc: number; boleto: number };
  riskDistribution: { baixo: number; medio: number; alto: number };
}

interface PaymentAlert {
  id: string;
  type: string;
  amount: string;
  description: string | null;
  createdAt: string;
}

export interface PaymentTransactionDetail {
  id: string;
  externalRef: string;
  type: string;
  amount: string;
  riskLevel: string;
  status: string;
  description: string | null;
  threatDescription: string | null;
  accountAgeDays: number | null;
  destination: string | null;
  holderName: string | null;
  holderDocument: string | null;
  holderEmail: string | null;
  originCity: string | null;
  originState: string | null;
  originCountry: string | null;
  originIp: string | null;
  createdAt: string;
}

export function usePaymentRiskSummary() {
  return useQuery({
    queryKey: ['payment-risk', 'summary'],
    queryFn: async () => {
      const { data } = await api.get<PaymentSummary>('/payment-risk/summary');
      return data;
    },
    refetchInterval: 30000,
  });
}

export function usePaymentRiskAlerts() {
  return useQuery({
    queryKey: ['payment-risk', 'alerts'],
    queryFn: async () => {
      const { data } = await api.get<PaymentAlert[]>('/payment-risk/alerts', { params: { limit: 8 } });
      return data;
    },
    refetchInterval: 30000,
  });
}

export function usePaymentTransactionDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['payment-risk', 'transaction', id],
    queryFn: async () => {
      const { data } = await api.get<PaymentTransactionDetail>(`/payment-risk/transactions/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}
