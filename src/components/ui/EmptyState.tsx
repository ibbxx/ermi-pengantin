'use client';

import { LucideIcon, Search } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon = Search,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-gold-light/40 rounded-3xl bg-ivory/30 max-w-md mx-auto my-8">
      <div className="w-12 h-12 bg-champagne text-gold-dark rounded-full flex items-center justify-center mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-serif font-bold text-charcoal mb-2">{title}</h3>
      <p className="text-sm text-stone-muted leading-relaxed mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-gold hover:bg-gold-dark text-white font-semibold text-xs tracking-wider uppercase rounded-full transition-all duration-300 shadow-md"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
