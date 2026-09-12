import { createContext, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '../utils/cn';

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const COLORS = {
  success: 'text-emerald-400 border-emerald-400/20',
  error: 'text-rose-400 border-rose-400/20',
  info: 'text-cyan-400 border-cyan-400/20',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, type, title, message }]);
      if (duration) setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
          <AnimatePresence>
            {toasts.map((t) => {
              const Icon = ICONS[t.type];
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: 40, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={cn('glass-panel flex items-start gap-3 bg-surface/95 p-4', COLORS[t.type])}
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    {t.title && <p className="text-sm font-semibold text-ink">{t.title}</p>}
                    {t.message && <p className="text-xs text-ink-3">{t.message}</p>}
                  </div>
                  <button onClick={() => dismiss(t.id)} className="text-ink-muted hover:text-ink">
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
