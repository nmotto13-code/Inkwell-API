import { cloneElement, createContext, useContext, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AlertDialogContext = createContext(null);

export function AlertDialog({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

export function AlertDialogTrigger({ asChild, children }) {
  const { setOpen } = useContext(AlertDialogContext);
  if (asChild && children) {
    return cloneElement(children, {
      onClick: (event) => {
        children.props?.onClick?.(event);
        setOpen(true);
      },
    });
  }

  return <Button onClick={() => setOpen(true)}>{children}</Button>;
}

export function AlertDialogContent({ className, children }) {
  const { open } = useContext(AlertDialogContext);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className={cn('w-full max-w-md rounded-2xl bg-white p-6 shadow-xl', className)}>
        {children}
      </div>
    </div>
  );
}

export function AlertDialogHeader({ className, ...props }) {
  return <div className={cn('space-y-1', className)} {...props} />;
}

export function AlertDialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold text-slate-900', className)} {...props} />;
}

export function AlertDialogDescription({ className, ...props }) {
  return <p className={cn('text-sm text-slate-600', className)} {...props} />;
}

export function AlertDialogFooter({ className, ...props }) {
  return <div className={cn('mt-5 flex justify-end gap-2', className)} {...props} />;
}

export function AlertDialogCancel({ className, children, ...props }) {
  const { setOpen } = useContext(AlertDialogContext);
  return (
    <Button variant="outline" className={className} onClick={() => setOpen(false)} {...props}>
      {children}
    </Button>
  );
}

export function AlertDialogAction({ className, children, onClick, ...props }) {
  const { setOpen } = useContext(AlertDialogContext);
  return (
    <Button
      className={className}
      onClick={(event) => {
        onClick?.(event);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
