import React, { useEffect } from 'react';
import Button from './Button';

/**
 * Modern SaaS Modal Component
 * 
 * @param {boolean} isOpen - controls visibility
 * @param {function} onClose - function to close modal
 * @param {string} title - modal header title
 * @param {string} description - optional modal sub-heading
 * @param {React.ReactNode} children - modal body content
 * @param {boolean} loading - applies loading state to action button
 * @param {string} actionLabel - text for the confirm/action button
 * @param {function} onAction - handler for the action button
 * @param {string} actionVariant - Button variant ('primary', 'danger', etc.)
 * @param {string} icon - optional material icon for header
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  loading = false,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  icon
}) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#06080F]/80 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-lg bg-surface border border-outline-v/20 rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,0.8)] flex flex-col animate-scale-in overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent z-10" />
        <div className="flex items-start justify-between p-6 border-b border-outline-v/20 bg-s-mid/30">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                actionVariant === 'danger' ? 'bg-error/10 text-error' : 
                actionVariant === 'warning' ? 'bg-warning/10 text-warning' : 
                'bg-primary/10 text-primary'
              }`}>
                <span className="material-symbols-outlined icon-fill">{icon}</span>
              </div>
            )}
            <div>
              <h2 id="modal-title" className="text-[18px] font-extrabold text-on-surface leading-tight">
                {title}
              </h2>
              {description && (
                <p className="text-[13px] text-on-sv mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-sv hover:bg-s-mid hover:text-on-surface transition-colors focus:ring-2 focus:ring-primary/20 shrink-0"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar max-h-[60vh]">
          {children}
        </div>

        {/* Footer */}
        <div className="p-5 flex items-center justify-end gap-3 bg-s-low/90 border-t border-outline-v/20">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {actionLabel && onAction && (
            <Button 
              variant={actionVariant} 
              onClick={onAction} 
              loading={loading}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
