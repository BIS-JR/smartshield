import { ShieldOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionButtonGroupProps {
  onBlock: () => void;
  onRelease: () => void;
  disabled?: boolean;
}

export function ActionButtonGroup({ onBlock, onRelease, disabled }: ActionButtonGroupProps) {
  return (
    <>
      <Button variant="destructive" size="sm" onClick={onBlock} disabled={disabled}>
        <ShieldOff className="h-4 w-4" />
        Bloquear
      </Button>
      <Button variant="outline" size="sm" onClick={onRelease} disabled={disabled}>
        <ShieldCheck className="h-4 w-4" />
        Liberar
      </Button>
    </>
  );
}
