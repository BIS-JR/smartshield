import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, KeyRound, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

export function LandingPage() {
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = status === 'authenticated';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-glow shadow-primary/40">
        <ShieldCheck className="h-8 w-8 text-primary-foreground" />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground">SmartShield</h1>
        <p className="mt-1 text-lg text-muted">Fraud Intelligence Platform</p>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted">
          Proteção antifraude integrada: análise de documentos, redes de relacionamento, risco de pagamentos e
          investigação assistida por IA em uma única plataforma.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {isAuthenticated ? (
          <Button asChild size="default">
            <Link to="/dashboard">
              Acessar Plataforma
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild size="default">
              <Link to="/login">
                <Lock className="h-4 w-4" />
                Entrar
              </Link>
            </Button>
            <Button asChild variant="outline" size="default">
              <Link to="/esqueci-senha">
                <KeyRound className="h-4 w-4" />
                Esqueci minha senha
              </Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
