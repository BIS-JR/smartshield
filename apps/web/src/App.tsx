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
import { useBootstrapSession } from '@/app/useBootstrapSession';

const PLACEHOLDER_MODULES = [
  { path: '/corporate-fraud', key: 'corporate_fraud' },
  { path: '/payment-risk', key: 'payment_risk' },
  { path: '/supplier-intelligence', key: 'supplier_intelligence' },
  { path: '/investigation', key: 'investigation' },
  { path: '/executive-dashboard', key: 'executive_dashboard' },
  { path: '/rules-engine', key: 'rules_engine' },
];

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
        {PLACEHOLDER_MODULES.map(({ path, key }) => (
          <Route key={path} path={path} element={<ModulePlaceholder moduleKey={key} />} />
        ))}
      </Route>
    </Routes>
  );
}

export default App;
