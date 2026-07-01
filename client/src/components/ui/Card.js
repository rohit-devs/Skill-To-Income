import React from 'react';

/**
 * Card — base surface block
 * @param {'default'|'elevated'|'bordered'|'flat'} variant
 * @param {boolean} hover - adds hover lift
 * @param {boolean} clickable - adds pointer cursor
 * @param {'sm'|'md'|'lg'} padding
 */
export default function Card({
  children,
  variant = 'default',
  hover = false,
  clickable = false,
  padding = 'md',
  className = '',
  ...props
}) {
  const variants = {
    default:  'bg-s-low border border-outline-v/40',
    elevated: 'bg-s-low border border-outline-v/20 shadow-xl shadow-black/20',
    bordered: 'bg-transparent border border-outline-v',
    flat:     'bg-s-mid border-none',
    glass:    'bg-surface/50 backdrop-blur-xl border border-white/5',
  };

  const paddings = {
    none: '',
    sm:   'p-4',
    md:   'p-5',
    lg:   'p-7',
  };

  const hoverCls = hover
    ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30 hover:border-primary/20'
    : '';

  const clickCls = clickable ? 'cursor-pointer' : '';

  return (
    <div
      className={`rounded-xl ${variants[variant] || variants.default} ${paddings[padding] || paddings.md} ${hoverCls} ${clickCls} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardHeader — title + optional action row
 */
export function CardHeader({ title, subtitle, action, icon, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-5 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-lg icon-fill">{icon}</span>
          </div>
        )}
        <div>
          <h3 className="text-[15px] font-extrabold text-on-surface leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-on-sv mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
