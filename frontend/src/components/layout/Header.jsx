import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Bell, Search, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { initials, timeAgo } from '../../utils/format';
import { cn } from '../../utils/cn';

export default function Header({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    notificationService.getNotifications().then(setNotifications);
  }, []);

  useEffect(() => {
    function onClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-hairline-2 bg-page/70 px-4 backdrop-blur-xl sm:px-6">
      <button onClick={onMenuClick} className="rounded-lg p-2 text-ink-3 hover:bg-glass-1 hover:text-ink lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      {title ? (
        <h1 className="font-display text-base font-semibold text-ink lg:hidden">{title}</h1>
      ) : (
        <div className="relative hidden max-w-sm flex-1 lg:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input placeholder="Search..." className="input-base pl-10" aria-label="Search" />
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-3 transition-colors hover:bg-glass-1 hover:text-ink"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-2 top-2 flex h-2 w-2 items-center justify-center rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)] animate-pulse-glow" />
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
                className="glass-panel absolute right-0 mt-2 w-80 bg-surface/95 p-2"
              >
                <div className="flex items-center justify-between px-2 py-1.5">
                  <p className="text-sm font-semibold text-ink">Notifications</p>
                  {unread > 0 && <span className="text-xs text-cyan-400">{unread} new</span>}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={cn('rounded-xl px-3 py-2.5 transition-colors hover:bg-glass-1', !n.read && 'bg-cyan-400/5')}>
                      <p className="text-sm font-medium text-ink">{n.title}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">{n.message}</p>
                      <p className="mt-1 text-[11px] text-ink-faint">{timeAgo(n.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen((o) => !o)} className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition-colors hover:bg-glass-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 text-xs font-bold text-cyan-200">
              {initials(user?.name || 'U')}
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-ink-muted sm:block" />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
                className="glass-panel absolute right-0 mt-2 w-56 bg-surface/95 p-2"
              >
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
                  <p className="truncate text-xs text-ink-muted">{user?.email}</p>
                </div>
                <div className="my-1 h-px bg-glass-4" />
                <button onClick={() => navigate(`/${user?.role}/profile`)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-2 hover:bg-glass-1">
                  <User className="h-4 w-4" /> Profile
                </button>
                <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-2 hover:bg-glass-1">
                  <Settings className="h-4 w-4" /> Settings
                </button>
                <div className="my-1 h-px bg-glass-4" />
                <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-400/10">
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
