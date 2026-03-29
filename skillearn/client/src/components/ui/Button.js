import React from 'react';

/**
 * Button UI Primitive
 * @param {'primary'|'secondary'|'ghost'|'outline'|'danger'|'success'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading
 * @param {string} leftIcon - material-symbols name
 * @param {string} rightIcon - material-symbols name
 * @param {boolean} fullWidth
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-bold rounded-md border-none cursor-pointer transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none font-[inherit] whitespace-nowrap leading-none';

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-[13.5px]',
    lg: 'px-6 py-3 text-[15px]',
  };

  const variants = {
    primary:
      'bg-gradient-to-br from-[#3525CD] to-[#4F46E5] text-white shadow-lg shadow-indigo-900/30 hover:shadow-xl hover:shadow-indigo-900/40 hover:-translate-y-px',
    secondary:
      'bg-gradient-to-br from-[#EE9800] to-[#F59E0B] text-[#2A1700] shadow-lg shadow-amber-900/20 hover:shadow-xl hover:shadow-amber-900/30 hover:-translate-y-px',
    ghost:
      'bg-transparent text-primary hover:bg-primary/10',
    outline:
      'bg-transparent border border-[color:var(--outline-v)] text-[color:var(--on-sv)] hover:border-primary hover:text-primary',
    danger:
      'bg-transparent border border-error/40 text-error hover:bg-error/10',
    success:
      'bg-[#16A34A] text-white hover:bg-[#15803D]',
    surface:
      'bg-[color:var(--s-highest)] text-primary hover:bg-[color:var(--s-high)]',
  };

  return (
    <button
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : leftIcon ? (
        <span className="material-symbols-outlined text-[18px] leading-none">{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon && (
        <span className="material-symbols-outlined text-[18px] leading-none">{rightIcon}</span>
      )}
    </button>
  );
}
