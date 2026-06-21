'use client';

import { AlertOctagon } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export default function ErrorState({
  title = 'Terjadi Kesalahan',
  message,
  onRetry,
  retryText = 'Coba Lagi',
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-red-100 rounded-3xl bg-red-50/20 max-w-md mx-auto my-8">
      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
        <AlertOctagon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-serif font-bold text-red-900 mb-2">{title}</h3>
      <p className="text-sm text-red-700/80 leading-relaxed mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs tracking-wider uppercase rounded-full transition-all duration-300 shadow-md"
        >
          {retryText}
        </button>
      )}
    </div>
  );
}
