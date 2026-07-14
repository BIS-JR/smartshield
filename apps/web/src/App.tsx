import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/app/AppLayout';
import { useBootstrapSession } from '@/app/useBootstrapSession';

const LandingPage = lazy(() => import('@/app/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('@/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const TwoFactorVerifyPage = lazy(() => import('@/auth/TwoFactorVerifyPage').then((m) => ({ default: m.TwoFactorVerifyPage })));
const DashboardPage = lazy(() => import('@/app/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const SecurityPage = lazy(() => import('@/app/security/SecurityPage').then((m) => ({ default: m.SecurityPage })));
const DocumentAiListPage = lazy(() => import('@/app/document-ai/DocumentAiListPage').then((m) => ({ default: m.DocumentAiListPage })));
const DocumentAiDetailPage = lazy(() => import('@/app/document-ai/DocumentAiDetailPage').then((m) => ({ default: m.DocumentAiDetailPage })));
const SupplierIntelligenceListPage = lazy(() =>
  import('@/app/supplier-intelligence/SupplierIntelligenceListPage').then((m) => ({ default: m.SupplierIntelligenceListPage })),
);
const SupplierIntelligenceDetailPage = lazy(() =>
  import('@/app/supplier-intelligence/SupplierIntelligenceDetailPage').then((m) => ({ default: m.SupplierIntelligenceDetailPage })),
);
const CorporateFraudListPage = lazy(() => import('@/app/corporate-fraud/CorporateFraudListPage').then((m) => ({ default: m.CorporateFraudListPage })));
const CorporateFraudDetailPage = lazy(() =>
  import('@/app/corporate-fraud/CorporateFraudDetailPage').then((m) => ({ default: m.CorporateFraudDetailPage })),
);
const PaymentRiskPage = lazy(() => import('@/app/payment-risk/PaymentRiskPage').then((m) => ({ default: m.PaymentRiskPage })));
const PaymentRiskAlertDetailPage = lazy(() =>
  import('@/app/payment-risk/PaymentRiskAlertDetailPage').then((m) => ({ default: m.PaymentRiskAlertDetailPage })),
);
const ExecutiveDashboardPage = lazy(() =>
  import('@/app/executive-dashboard/ExecutiveDashboardPage').then((m) => ({ default: m.ExecutiveDashboardPage })),
);
const InvestigationPage = lazy(() => import('@/app/investigation/InvestigationPage').then((m) => ({ default: m.InvestigationPage })));
const RulesEnginePage = lazy(() => import('@/app/rules-engine/RulesEnginePage').then((m) => ({ default: m.RulesEnginePage })));

function RouteFallback() {
  return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted">Carregando...</div>;
}

function App() {
  useBootstrapSession();

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
        <Route path="/verificar-2fa" element={<TwoFactorVerifyPage />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/document-ai" element={<DocumentAiListPage />} />
          <Route path="/document-ai/:id" element={<DocumentAiDetailPage />} />
          <Route path="/supplier-intelligence" element={<SupplierIntelligenceListPage />} />
          <Route path="/supplier-intelligence/:id" element={<SupplierIntelligenceDetailPage />} />
          <Route path="/corporate-fraud" element={<CorporateFraudListPage />} />
          <Route path="/corporate-fraud/:id" element={<CorporateFraudDetailPage />} />
          <Route path="/payment-risk" element={<PaymentRiskPage />} />
          <Route path="/payment-risk/alertas/:id" element={<PaymentRiskAlertDetailPage />} />
          <Route path="/executive-dashboard" element={<ExecutiveDashboardPage />} />
          <Route path="/investigation" element={<InvestigationPage />} />
          <Route path="/rules-engine" element={<RulesEnginePage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
