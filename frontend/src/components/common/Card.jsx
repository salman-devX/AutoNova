import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function Card({ className, hover = false, children, ...props }) {
  return (
    <div className={cn(hover ? 'glass-card-hover' : 'glass-card', className)} {...props}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, trend, trendLabel, accent = 'cyan', index = 0 }) {
  const accents = {
    cyan: 'from-cyan-400/20 to-cyan-400/5 text-cyan-300',
    blue: 'from-blue-400/20 to-blue-400/5 text-blue-300',
    emerald: 'from-emerald-400/20 to-emerald-400/5 text-emerald-300',
    amber: 'from-amber-400/20 to-amber-400/5 text-amber-300',
    rose: 'from-rose-400/20 to-rose-400/5 text-rose-300',
  };
  const isUp = typeof trend === 'number' ? trend >= 0 : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="glass-card-hover"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink">{value}</p>
        </div>
        {Icon && (
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br', accents[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span className={cn('flex items-center gap-0.5 font-semibold', isUp ? 'text-emerald-400' : 'text-rose-400')}>
            {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(trend)}%
          </span>
          <span className="text-ink-muted">{trendLabel || 'vs last month'}</span>
        </div>
      )}
    </motion.div>
  );
}

export function ChartCard({ title, subtitle, action, children, className }) {
  return (
    <div className={cn('glass-card', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
          {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
