import { forwardRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Select = forwardRef(function Select(
  { label, error, hint, options = [], placeholder = 'Select...', required, className, containerClassName, ...props },
  ref
) {
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink-2">
          {label}
          {required && <span className="text-cyan-400">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn('input-base appearance-none pr-10', error && 'input-error', className)}
          {...props}
        >
          <option value="" disabled className="bg-surface">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
      </div>
      {error ? <p className="mt-1.5 text-xs text-rose-400">{error}</p> : hint ? <p className="mt-1.5 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, required, className, containerClassName, rows = 4, ...props },
  ref
) {
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink-2">
          {label}
          {required && <span className="text-cyan-400">*</span>}
        </label>
      )}
      <textarea ref={ref} rows={rows} className={cn('input-base resize-none', error && 'input-error', className)} {...props} />
      {error ? <p className="mt-1.5 text-xs text-rose-400">{error}</p> : hint ? <p className="mt-1.5 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
});

export const Checkbox = forwardRef(function Checkbox({ label, className, ...props }, ref) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-2.5 select-none', className)}>
      <span className="relative flex h-4.5 w-4.5 items-center justify-center">
        <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
        <span className="h-4.5 w-4.5 rounded-md border border-hairline-3 bg-glass-1 transition-all peer-checked:border-cyan-400 peer-checked:bg-gradient-to-br peer-checked:from-cyan-400 peer-checked:to-blue-500" />
        <Check className="absolute h-3 w-3 text-slate-950 opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
      </span>
      {label && <span className="text-sm text-ink-3">{label}</span>}
    </label>
  );
});
