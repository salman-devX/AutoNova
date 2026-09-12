import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, ShieldCheck, Clock, Sparkles } from 'lucide-react';

const POINTS = [
  { icon: ShieldCheck, text: 'Transparent, trackable vehicle servicing' },
  { icon: Clock, text: 'Book appointments in under a minute' },
  { icon: Sparkles, text: 'Real-time updates from inspection to pickup' },
];

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <Link to="/" className="relative z-10 flex items-center gap-2 font-display text-lg font-bold text-ink">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_4px_16px_rgba(34,211,238,0.4)]">
            <Wrench className="h-5 w-5 text-slate-950" />
          </span>
          AutoNova
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <h2 className="font-display text-3xl font-bold text-ink">
            Your car's service journey, <span className="text-gradient">fully transparent.</span>
          </h2>
          <p className="mt-3 max-w-md text-ink-3">
            Manage vehicles, book appointments, and track every stage of service — from a single dashboard.
          </p>
          <div className="mt-8 space-y-4">
            {POINTS.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-glass-1 text-cyan-300">
                  <p.icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-sm text-ink-2">{p.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="relative z-10 text-xs text-ink-faint">© {new Date().getFullYear()} AutoNova Workshop Systems</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-page px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2 font-display text-lg font-bold text-ink lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500">
              <Wrench className="h-4.5 w-4.5 text-slate-950" />
            </span>
            AutoNova
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
