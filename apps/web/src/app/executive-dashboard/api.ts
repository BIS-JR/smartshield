import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Summary {
  totalIncidents: number;
  fraudsDetected: number;
  activeBlocks: number;
  estimatedRoi: number;
}

interface FraudByModule {
  document_ai: number;
  corporate_fraud: number;
  supplier_intelligence: number;
}

interface SeverityDistribution {
  leve: number;
  moderado: number;
  grave: number;
}

interface Trends {
  days: string[];
  documentAi: number[];
  corporateFraud: number[];
  supplierIntelligence: number[];
}

interface RegionRisk {
  region: string;
  incidentCount: number;
  riskPercentage: number;
}

export function useExecutiveSummary() {
  return useQuery({
    queryKey: ['executive-dashboard', 'summary'],
    queryFn: async () => (await api.get<Summary>('/executive-dashboard/summary')).data,
  });
}

export function useFraudByModule() {
  return useQuery({
    queryKey: ['executive-dashboard', 'fraud-by-module'],
    queryFn: async () => (await api.get<FraudByModule>('/executive-dashboard/fraud-by-module')).data,
  });
}

export function useSeverityDistribution() {
  return useQuery({
    queryKey: ['executive-dashboard', 'severity-distribution'],
    queryFn: async () => (await api.get<SeverityDistribution>('/executive-dashboard/severity-distribution')).data,
  });
}

export function useTrends() {
  return useQuery({
    queryKey: ['executive-dashboard', 'trends'],
    queryFn: async () => (await api.get<Trends>('/executive-dashboard/trends')).data,
  });
}

export function useRegionRisk() {
  return useQuery({
    queryKey: ['executive-dashboard', 'region-risk'],
    queryFn: async () => (await api.get<RegionRisk[]>('/executive-dashboard/region-risk')).data,
  });
}
