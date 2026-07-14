import {
  FileSearch,
  GitBranch,
  CreditCard,
  Truck,
  MessageSquare,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export const moduleIconMap: Record<string, LucideIcon> = {
  'file-search': FileSearch,
  'git-branch': GitBranch,
  'credit-card': CreditCard,
  truck: Truck,
  'message-square': MessageSquare,
  'bar-chart-3': BarChart3,
  settings: Settings,
};

export const moduleRouteMap: Record<string, string> = {
  document_ai: '/document-ai',
  corporate_fraud: '/corporate-fraud',
  payment_risk: '/payment-risk',
  supplier_intelligence: '/supplier-intelligence',
  investigation: '/investigation',
  executive_dashboard: '/executive-dashboard',
  rules_engine: '/rules-engine',
};
