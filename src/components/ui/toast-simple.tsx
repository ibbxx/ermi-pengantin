'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((current) => [...current, { id, message, type }]);

    // Auto remove after 3.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Floating container */}
      <div 
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="assertive"
      >
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 bg-background text-foreground",
                isSuccess && "border-emerald-200 bg-emerald-50/90 text-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-50",
                isError && "border-destructive/30 bg-destructive/10 text-destructive",
                isWarning && "border-amber-200 bg-amber-50/90 text-amber-900 dark:bg-amber-950/90 dark:text-amber-50",
                t.type === 'info' && "border-border bg-card/95"
              )}
            >
              {/* Icon */}
              {isSuccess && <CheckCircle2 className="size-4.5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />}
              {isError && <AlertCircle className="size-4.5 shrink-0 text-destructive mt-0.5" />}
              {isWarning && <AlertCircle className="size-4.5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />}
              {t.type === 'info' && <Info className="size-4.5 shrink-0 text-primary mt-0.5" />}

              {/* Message */}
              <div className="flex-1 text-xs font-semibold leading-normal">
                {t.message}
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 rounded-lg p-0.5 hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-3.5" />
                <span className="sr-only">Tutup</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
