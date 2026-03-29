import React, { useEffect, useRef, useState } from 'react';

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    const num = parseFloat(String(target).replace(/[^0-9.]/g, '')) || 0;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * num));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}

const ICON_BG = {
  primary:   'bg-primary/20 text-primary shadow-primary/10',
  success:   'bg-success/20 text-success shadow-success/10',
  warning:   'bg-warning/20 text-warning shadow-warning/10',
  secondary: 'bg-secondary/20 text-secondary shadow-secondary/10',
  error:     'bg-error/20 text-error shadow-error/10',
};

const ACCENT_BORDER = {
  primary:   'border-l-primary',
  success:   'border-l-success',
  warning:   'border-l-warning',
  secondary: 'border-l-secondary',
  error:     'border-l-error',
};

/**
 * Enhanced StatCard with count-up animation and accent border
 * @param {string} title
 * @param {string|number} value  - if starts with ₹ prefix is extracted
 * @param {string} icon          - material-symbols name
 * @param {'primary'|'success'|'warning'|'secondary'|'error'} variant
 * @param {string|{value:string,isUp:boolean}} trend
 * @param {string} subtitle      - secondary descriptor line
 */
export default function StatCard({ title, value, icon, variant = 'primary', trend, subtitle }) {
  const isTrendObj = typeof trend === 'object' && trend !== null;
  const trendText = isTrendObj ? trend.value : trend;
  const isTrendUp  = isTrendObj ? trend.isUp  : true;

  // Extract prefix (₹) and raw number for animation
  const strVal    = String(value ?? '');
  const prefix    = strVal.startsWith('₹') ? '₹' : '';
  const rawNum    = parseFloat(strVal.replace(/[^0-9.]/g, '')) || 0;
  const isNumeric = !isNaN(rawNum) && rawNum > 0;

  const animated  = useCountUp(isNumeric ? rawNum : 0);

  const displayValue = isNumeric
    ? `${prefix}${animated.toLocaleString('en-IN')}`
    : strVal;

  const currentVariant = ICON_BG[variant] || ICON_BG.primary;
  const accentBorder   = ACCENT_BORDER[variant] || ACCENT_BORDER.primary;

  return (
    <div
      className={`relative bg-s-low rounded-xl p-5 border border-outline-v/40 border-l-[3px] ${accentBorder}
        flex flex-col gap-4 shadow-sm
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group`}
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/[0.015] to-transparent" />

      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg ${currentVariant}`}>
          <span className="material-symbols-outlined text-[22px] icon-fill">{icon}</span>
        </div>

        {trendText && (
          <div
            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 border ${
              isTrendUp
                ? 'text-success bg-success/10 border-success/20'
                : 'text-error bg-error/10 border-error/20'
            }`}
          >
            <span className="material-symbols-outlined text-[12px] leading-none">
              {isTrendUp ? 'trending_up' : 'trending_down'}
            </span>
            {trendText}
          </div>
        )}
      </div>

      <div>
        <div className="text-[26px] font-black text-on-surface tracking-tight leading-none mb-1.5 tabular-nums">
          {displayValue}
        </div>
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-on-sv">{title}</div>
        {subtitle && <div className="text-[11px] text-on-sv/70 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}
