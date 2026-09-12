import { cn } from '../../utils/cn';
import { STATUS_STYLES } from '../../utils/constants';

export function Badge({ children, className, color }) {
  const colors = {
    cyan: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20',
    slate: 'bg-glass-1 text-ink-2 border-hairline-2',
  };
  return <span className={cn('badge', colors[color] || colors.slate, className)}>{children}</span>;
}

export function StatusBadge({ status, className }) {
  const dotColor = {
    Pending: 'bg-amber-400', Confirmed: 'bg-blue-400', 'In Progress': 'bg-cyan-400',
    Completed: 'bg-emerald-400', Cancelled: 'bg-rose-400', Paid: 'bg-emerald-400',
    Unpaid: 'bg-amber-400', Partial: 'bg-blue-400', Overdue: 'bg-rose-400',
    Good: 'bg-emerald-400', 'Needs Attention': 'bg-amber-400', Critical: 'bg-rose-400',
    Active: 'bg-emerald-400', 'Low Stock': 'bg-amber-400', 'Out of Stock': 'bg-rose-400',
  }[status] || 'bg-slate-400';

  return (
    <span className={cn('badge', STATUS_STYLES[status] || 'bg-glass-1 text-ink-2 border-hairline-2', className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} />
      {status}
    </span>
  );
}
