import { Outlet } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { HeaderBar } from '@/components/shell/HeaderBar';
import { SwipeNav } from '@/components/shell/SwipeNav';

export function AppLayout() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <HeaderBar />
        <SwipeNav />
        <Outlet />
      </div>
    </ProtectedRoute>
  );
}
