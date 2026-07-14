import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro não tratado na aplicação:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center text-foreground">
          <h1 className="text-lg font-semibold">Algo deu errado</h1>
          <p className="max-w-md text-sm text-muted">
            {this.state.error.message || 'Ocorreu um erro inesperado. Veja o console do navegador para detalhes.'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-surface-hover"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
