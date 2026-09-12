import { Search, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';

export function SearchBar({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="input-base pl-10"
        aria-label={placeholder}
      />
    </div>
  );
}

export function FilterDropdown({ label, value, onChange, options = [] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="glass appearance-none rounded-xl py-2.5 pl-4 pr-9 text-sm text-ink-2 outline-none transition-colors hover:border-cyan-400/30 cursor-pointer"
      >
        <option value="" className="bg-surface">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface">{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
    </div>
  );
}

export function FilterBar({ children }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SlidersHorizontal className="h-4 w-4 text-ink-muted hidden sm:block" />
      {children}
    </div>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-between gap-4 pt-2">
      <p className="text-xs text-ink-muted">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg glass text-ink-3 hover:text-ink disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) => (
          <span key={p} className="flex items-center">
            {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-ink-faint">...</span>}
            <button
              onClick={() => onChange(p)}
              className={cn(
                'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors',
                p === page ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950' : 'text-ink-3 hover:bg-glass-1 hover:text-ink'
              )}
            >
              {p}
            </button>
          </span>
        ))}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg glass text-ink-3 hover:text-ink disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
