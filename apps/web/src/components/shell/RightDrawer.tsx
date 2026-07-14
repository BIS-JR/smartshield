import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface RightDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}

export function RightDrawer({ open, onOpenChange, title, children }: RightDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-border bg-surface p-6 shadow-xl outline-none">
          <div className="mb-6 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-foreground">{title}</Dialog.Title>
            <Dialog.Close className="rounded-md p-1 text-muted hover:bg-surface-hover hover:text-foreground">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
