import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarCheck, Car, Radar, PackageCheck, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';

const DETAILED_STEPS = [
  {
    icon: CalendarCheck, title: '1. Book Online',
    desc: 'Choose your vehicle, pick a service from the catalog, and select a time slot that actually shows real availability — no double-booked slots, ever.',
    points: ['Pick your vehicle & service in seconds', 'See only genuinely open time slots', 'Instant confirmation notification'],
  },
  {
    icon: Car, title: '2. Drop Off',
    desc: 'Arrive at your booked slot. Reception checks your vehicle in and a service order is opened — the same order tracks everything until pickup.',
    points: ['No waiting in line — you\'re already booked', 'Vehicle condition logged at check-in', 'A dedicated mechanic is assigned to your job'],
  },
  {
    icon: Radar, title: '3. Track Live',
    desc: 'Your service order moves through a visible pipeline. Every stage change sends you a notification, so you always know exactly where your car stands.',
    points: ['Vehicle Received → Inspection → In Progress → Quality Check → Ready', 'Inspection notes and recommendations, in plain language', 'No phone calls needed to check status'],
  },
  {
    icon: PackageCheck, title: '4. Pick Up',
    desc: 'The moment your car passes quality check, you\'re notified with an itemized invoice — parts, labor, and tax broken down clearly, calculated automatically.',
    points: ['Transparent, itemized invoice', 'Multiple payment options', 'Full service history saved to your account'],
  },
];

const STAGES = ['Booked', 'Vehicle Received', 'Inspection', 'In Progress', 'Quality Check', 'Ready for Pickup', 'Completed'];

export default function HowItWorksPage() {
  const navigate = useNavigate();

  return (
    <>
      <section className="relative overflow-hidden pt-36 pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
            How It Works
          </span>
          <h1 className="text-4xl font-bold sm:text-5xl">From booking to pickup, fully tracked</h1>
          <p className="mt-4 text-lg text-ink-3">No guesswork, no phone tag — just a clear, visible path from the moment you book to the moment you drive away.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="glass-panel flex flex-wrap items-center justify-center gap-2 p-4">
          {STAGES.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <StatusBadge status={i === 0 ? 'Pending' : i < 4 ? 'Confirmed' : i < 6 ? 'In Progress' : 'Completed'} className="whitespace-nowrap" />
              {i < STAGES.length - 1 && <span className="text-ink-faint">→</span>}
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-ink-muted">The exact pipeline every service order moves through, visible to you in real time.</p>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {DETAILED_STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass-card grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 shadow-[0_4px_20px_rgba(34,211,238,0.35)]">
                <step.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-ink-3">{step.desc}</p>
                <ul className="mt-4 space-y-2">
                  {step.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-ink-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Ready to try it yourself?</h2>
          <Button size="lg" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/register')}>Book Your First Appointment</Button>
        </div>
      </section>
    </>
  );
}
