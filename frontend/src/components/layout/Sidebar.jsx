import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, X, LogOut } from 'lucide-react';
import { cn } from '../../utils/cn';
import { NAV_CONFIG, ROLE_LABELS } from '../../utils/navConfig';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/format';

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const links = NAV_CONFIG[user?.role] || [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_4px_16px_rgba(34,211,238,0.4)]">
          <Wrench className="h-4.5 w-4.5 text-slate-950" />
        </span>
        <div>
          <p className="font-display text-sm font-bold text-ink leading-tight">AutoNova</p>
          <p className="text-[11px] text-ink-muted leading-tight">{ROLE_LABELS[user?.role]}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-none">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive ? 'text-ink' : 'text-ink-3 hover:bg-glass-3 hover:text-ink'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/15 to-blue-500/10 border border-cyan-400/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <link.icon className={cn('relative z-10 h-4.5 w-4.5', isActive && 'text-cyan-300')} />
                <span className="relative z-10">{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 border-t border-hairline-2 p-3">
        <div className="flex items-center gap-3 rounded-xl p-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 text-xs font-bold text-cyan-200">
            {initials(user?.name || 'U')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
            <p className="truncate text-xs text-ink-muted">{user?.email}</p>
          </div>
          <button onClick={logout} aria-label="Log out" className="text-ink-muted hover:text-rose-400">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-64 lg:border-r lg:border-hairline-2 lg:bg-surface/60 lg:backdrop-blur-xl">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-hairline-2 bg-surface/95 backdrop-blur-xl lg:hidden"
            >
              <button onClick={onClose} className="absolute right-3 top-3 rounded-lg p-1.5 text-ink-muted hover:bg-glass-3 hover:text-ink">
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
