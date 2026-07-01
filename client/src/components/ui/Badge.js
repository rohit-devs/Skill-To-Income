import React from 'react';

const VARIANTS = {
  primary:   'bg-primary/15 text-primary border-primary/20',
  success:   'bg-success/15 text-success border-success/20',
  warning:   'bg-warning/15 text-warning border-warning/20',
  error:     'bg-error/15 text-error border-error/20',
  secondary: 'bg-secondary/15 text-secondary border-secondary/20',
  outline:   'bg-transparent text-on-sv border-outline-v',
  surface:   'bg-s-highest text-on-sv border-transparent',
};

const STATUS_MAP = {
  open:               'primary',
  assigned:           'warning',
  submitted:          'secondary',
  under_review:       'secondary',
  approved:           'success',
  revision_requested: 'error',
  completed:          'success',
  cancelled:          'outline',
  disputed:           'error',
};

const STATUS_LABEL = {
  open:               'Open',
  assigned:           'In Progress',
  submitted:          'Submitted',
  under_review:       'Under Review',
  approved:           'Approved',
  revision_requested: 'Revision Needed',
  completed:          'Completed',
  cancelled:          'Cancelled',
  disputed:           'Disputed',
};

/**
 * @param {'primary'|'success'|'warning'|'error'|'secondary'|'outline'|'surface'} variant
 * @param {string} status - Optional task status (auto-maps variant + label)
 * @param {string} icon - Optional material-symbols icon name
 * @param {'sm'|'md'} size
 */
export default function Badge({ children, variant = 'primary', status, icon, size = 'md', className = '' }) {
  const resolvedVariant = status ? (STATUS_MAP[status] || 'outline') : variant;
  const label = status ? (STATUS_LABEL[status] || status) : children;

  const sizes = {
    sm: 'text-[9.5px] px-2 py-0.5 gap-1',
    md: 'text-[10.5px] px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wide uppercase rounded-full border ${VARIANTS[resolvedVariant] || VARIANTS.primary} ${sizes[size] || sizes.md} ${className}`}
    >
      {icon && (
        <span className="material-symbols-outlined leading-none" style={{ fontSize: 11 }}>
          {icon}
        </span>
      )}
      {label}
    </span>
  );
}
