'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';
export interface ToastItem { id: number; message: string; type: ToastType; }

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed top-16 right-4 z-[80] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
  const colorClass = toast.type === 'success' ? 'text-success' : toast.type === 'error' ? 'text-destructive' : 'text-primary';

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex items-center gap-2 bg-card border border-border rounded-xl shadow-lg px-4 py-3 max-w-xs pointer-events-auto"
      role="alert"
    >
      <Icon className={`w-5 h-5 ${colorClass} flex-shrink-0`} />
      <span className="text-sm text-foreground flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-muted-foreground hover:text-foreground flex-shrink-0"
        aria-label="关闭"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

let toastId = 0;
export function useToast() {
  const createToast = (message: string, type: ToastType = 'info'): ToastItem => {
    return { id: ++toastId, message, type };
  };
  return { createToast };
}
