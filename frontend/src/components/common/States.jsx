import { Loader2, Inbox, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from './Button';

export function Loader({ label = 'Loading...', className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-ink-muted', className)}>
      <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-glass-2 bg-[length:200%_100%]',
        'bg-gradient-to-r from-white/[0.04] via-white/[0.09] to-white/[0.04] animate-shimmer',
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-7 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-hairline-2 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-glass-1 text-ink-muted">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-display font-semibold text-ink">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', description = 'Please try again in a moment.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/5 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-400/10 text-rose-400">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div>
        <p className="font-display font-semibold text-ink">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      </div>
      {onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
