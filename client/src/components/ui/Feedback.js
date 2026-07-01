import React from 'react';

/**
 * Central Spinner component
 * @param {'sm'|'md'|'lg'} size
 * @param {string} className
 */
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-[3px]', lg: 'w-12 h-12 border-4' };
  return (
    <div
      className={`rounded-full border-[color:var(--s-high)] border-t-primary animate-spin ${sizes[size] || sizes.md} ${className}`}
    />
  );
}

/**
 * Full-page or section loading state
 */
export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-on-sv">
      <Spinner size="lg" />
      <p className="text-sm font-bold animate-pulse">{message}</p>
    </div>
  );
}

/**
 * Skeleton shimmer block — use as placeholder during loading
 */
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`bg-gradient-to-r from-s-mid via-s-high to-s-mid bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded-lg ${className}`}
    />
  );
}

/**
 * EmptyState component
 * @param {string} icon - material-symbols icon
 * @param {string} title
 * @param {string} description
 * @param {React.ReactNode} action - CTA element
 */
export function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6 gap-3">
      <div className="w-16 h-16 rounded-2xl bg-s-mid flex items-center justify-center mb-1 border border-outline-v/20">
        <span className="material-symbols-outlined text-on-sv text-3xl">{icon}</span>
      </div>
      {title && <h3 className="text-base font-black text-on-surface">{title}</h3>}
      {description && <p className="text-sm text-on-sv max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
