import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from './Button';

const SIZES = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl', '2xl': 'max-w-4xl' };

export function Modal({ open, onClose, title, description, size = 'md', children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn('glass-panel relative z-10 w-full max-h-[85vh] overflow-y-auto bg-surface/95 p-6', SIZES[size])}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                {title && <h2 id="modal-title" className="font-display text-lg font-semibold text-ink">{title}</h2>}
                {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-glass-3 hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
            {footer && <div className="mt-6 flex items-center justify-end gap-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', description, danger = true, loading = false, confirmLabel = 'Confirm' }) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-2xl', danger ? 'bg-rose-400/10 text-rose-400' : 'bg-cyan-400/10 text-cyan-400')}>
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
        {description && <p className="mt-1.5 text-sm text-ink-3">{description}</p>}
        <div className="mt-6 flex w-full gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} className="flex-1" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
