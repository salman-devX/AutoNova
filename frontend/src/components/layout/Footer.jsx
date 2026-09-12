import { Link } from 'react-router-dom';
import { Wrench, Mail, MapPin, Phone } from 'lucide-react';

const NAV_LINKS = [
  { to: '/services', label: 'Services' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/features', label: 'Features' },
  { to: '/contact', label: 'Contact' },
];

const ACCOUNT_LINKS = [
  { to: '/login', label: 'Sign In' },
  { to: '/register', label: 'Create Account' },
];

export default function Footer() {
  return (
    <footer className="border-t border-hairline-2 bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-3 md:grid-cols-4">
          <div className="sm:col-span-3 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500">
                <Wrench className="h-4.5 w-4.5 text-slate-950" />
              </span>
              AutoNova
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink-muted">
              Car service center management — transparent tracking, expert mechanics, effortless booking.
            </p>
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-ink">Explore</p>
            <ul className="mt-3 space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.to}><Link to={l.to} className="text-sm text-ink-muted transition-colors hover:text-cyan-400">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-ink">Account</p>
            <ul className="mt-3 space-y-2.5">
              {ACCOUNT_LINKS.map((l) => (
                <li key={l.to}><Link to={l.to} className="text-sm text-ink-muted transition-colors hover:text-cyan-400">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 grid gap-4 border-t border-hairline-2 pt-8 text-sm text-ink-muted sm:grid-cols-3">
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan-400" /> Lahore, Pakistan</div>
          <a href="tel:+923121634432" className="flex items-center gap-2 hover:text-cyan-400"><Phone className="h-4 w-4 text-cyan-400" /> +(92) 312 1634432</a>
          <a href="mailto:salmanahmad5962@gmail.com" className="flex items-center gap-2 hover:text-cyan-400"><Mail className="h-4 w-4 text-cyan-400" /> salmanahmad5962@gmail.com</a>
        </div>

        <div className="mt-8 border-t border-hairline-2 pt-6 text-center text-xs text-ink-faint sm:text-left">
          <p>© {new Date().getFullYear()} AutoNova Workshop Systems. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
