import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/app/LandingPage';
import { LoginPage } from '@/auth/LoginPage';
import { RegisterPage } from '@/auth/RegisterPage';
import { ForgotPasswordPage } from '@/auth/ForgotPasswordPage';
import { TwoFactorVerifyPage } from '@/auth/TwoFactorVerifyPage';
import { AppLayout } from '@/app/AppLayout';
import { DashboardPage } from '@/app/dashboard/DashboardPage';
import { ModulePlaceholder } from '@/app/ModulePlaceholder';
import { DocumentAiListPage } from '@/app/document-ai/DocumentAiListPage';
import { DocumentAiDetailPage } from '@/app/document-ai/DocumentAiDetailPage';
import { SupplierIntelligenceListPage } from '@/app/supplier-intelligence/SupplierIntelligenceListPage';
import { SupplierIntelligenceDetailPage } from '@/app/supplier-intelligence/SupplierIntelligenceDetailPage';
import { CorporateFraudListPage } from '@/app/corporate-fraud/CorporateFraudListPage';
import { CorporateFraudDetailPage } from '@/app/corporate-fraud/CorporateFraudDetailPage';
import { PaymentRiskPage } from '@/app/payment-risk/PaymentRiskPage';
import { PaymentRiskAlertDetailPage } from '@/app/payment-risk/PaymentRiskAlertDetailPage';
import { ExecutiveDashboardPage } from '@/app/executive-dashboard/ExecutiveDashboardPage';
import { InvestigationPage } from '@/app/investigation/InvestigationPage';
import { useBootstrapSession } from '@/app/useBootstrapSession';

const PLACEHOLDER_MODULES = [{ path: '/rules-engine', key: 'rules_engine' }];

function App() {
  useBootstrapSession();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
      <Route path="/verificar-2fa" element={<TwoFactorVerifyPage />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/security" element={<ModulePlaceholder moduleKey="security" />} />
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
        {PLACEHOLDER_MODULES.map(({ path, key }) => (
          <Route key={path} path={path} element={<ModulePlaceholder moduleKey={key} />} />
        ))}
      </Route>
    </Routes>
  );
}

export default App;
