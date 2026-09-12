import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Wrench, Gauge, ShieldCheck, PlayCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { services, steps, features, whyChooseUs } from '../../data/mockLanding';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] } }),
};

function Section({ id, className = '', children }) {
  return (
    <section id={id} className={`mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </section>
  );
}

function Eyebrow({ children }) {
  return (
    <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
      {children}
    </span>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden pt-40 pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <Eyebrow>Multi-workshop management, made simple</Eyebrow>
            <h1 className="font-display text-4xl font-bold leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
              Professional car servicing, <span className="text-gradient">fully transparent</span> from booking to pickup.
            </h1>
            <p className="mt-6 max-w-lg text-base text-ink-3 sm:text-lg">
              Book appointments in seconds, track your vehicle's service journey live, and manage everything —
              vehicles, invoices, and history — from one premium dashboard.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button size="lg" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/register')}>
                Book a Service
              </Button>
              <Button variant="secondary" size="lg" icon={PlayCircle} onClick={() => navigate('/login')}>
                Sign In to Dashboard
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ink-muted">
              {['No hidden charges', 'Certified mechanics', 'Live status tracking'].map((t) => (
                <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> {t}</span>
              ))}
            </div>
          </motion.div>

          {/* Hero visual — live tracking mockup card, not a stock photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="glass-panel relative mx-auto max-w-md animate-float bg-surface/60 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-ink-muted">Service Tracking</p>
                  <p className="font-display font-semibold text-ink">Honda Civic — LEA-2043</p>
                </div>
                <StatusBadge status="In Progress" />
              </div>
              <div className="mt-6 space-y-4">
                {['Vehicle Received', 'Inspection', 'Service In Progress'].map((s, i) => (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${i < 2 ? 'bg-emerald-400/20 text-emerald-300' : 'bg-cyan-400/20 text-cyan-300'}`}>
                      {i < 2 ? <CheckCircle2 className="h-4 w-4" /> : <Wrench className="h-3.5 w-3.5 animate-pulse" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-2">{s}</p>
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-glass-3">
                        <div className={`h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 ${i < 2 ? 'w-full' : 'w-2/3'}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between rounded-xl bg-glass-1 p-3">
                <span className="flex items-center gap-2 text-xs text-ink-3"><Gauge className="h-4 w-4 text-cyan-400" /> Est. completion</span>
                <span className="text-xs font-semibold text-ink">Today, 5:30 PM</span>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden glass-panel bg-surface/80 p-4 sm:block">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-xs text-ink-muted">Quality Check</p>
                  <p className="text-sm font-semibold text-ink">Passed</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= SERVICES PREVIEW ================= */}
      <Section id="services">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Our Services</Eyebrow>
          <h2 className="text-3xl font-bold sm:text-4xl">Everything your vehicle needs, in one place</h2>
          <p className="mt-3 text-ink-3">From routine maintenance to complex repairs, our certified team handles it all — with upfront pricing.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((s, i) => (
            <motion.div
              key={s.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              custom={i}
              variants={fadeUp}
              className="glass-card-hover"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/10 text-cyan-300">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm text-ink-3">{s.desc}</p>
              <p className="mt-3 text-sm font-semibold text-gradient">{s.price}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/services">
            <Button variant="secondary" icon={ArrowRight} iconPosition="right">View All 15 Services &amp; Pricing</Button>
          </Link>
        </div>
      </Section>

      {/* ================= HOW IT WORKS PREVIEW ================= */}
      <Section id="how-it-works" className="border-t border-hairline-1">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>How It Works</Eyebrow>
          <h2 className="text-3xl font-bold sm:text-4xl">Four steps to a serviced vehicle</h2>
        </div>
        <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute top-6 left-0 right-0 hidden h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent lg:block" />
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              custom={i}
              variants={fadeUp}
              className="relative text-center"
            >
              <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 font-display text-lg font-bold text-slate-950 shadow-[0_4px_20px_rgba(34,211,238,0.35)]">
                {i + 1}
              </div>
              <h3 className="mt-4 font-display font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm text-ink-3">{s.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/how-it-works">
            <Button variant="secondary" icon={ArrowRight} iconPosition="right">See the Full Walkthrough</Button>
          </Link>
        </div>
      </Section>

      {/* ================= FEATURES PREVIEW ================= */}
      <Section id="features" className="border-t border-hairline-1">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Eyebrow>Platform Features</Eyebrow>
            <h2 className="text-3xl font-bold sm:text-4xl">Built for total peace of mind</h2>
            <p className="mt-3 text-ink-3">A management system that keeps customers informed and workshops efficient.</p>
            <div className="mt-8 space-y-5">
              {features.map((f, i) => (
                <motion.div key={f.title} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i} variants={fadeUp} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-glass-3 text-cyan-300">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-ink">{f.title}</h4>
                    <p className="mt-0.5 text-sm text-ink-3">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Link to="/features" className="mt-8 inline-block">
              <Button variant="secondary" icon={ArrowRight} iconPosition="right">Explore All Features</Button>
            </Link>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-panel bg-surface/60 p-6"
          >
            <div className="grid grid-cols-2 gap-4">
              {whyChooseUs.map((w) => (
                <div key={w.title} className="rounded-xl bg-glass-1 p-4">
                  <w.icon className="h-5 w-5 text-cyan-400" />
                  <p className="mt-2 text-sm font-semibold text-ink">{w.title}</p>
                  <p className="mt-1 text-xs text-ink-muted">{w.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ================= CTA ================= */}
      <Section className="border-t border-hairline-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-blue-600/10 px-8 py-16 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">Ready to bring your workshop online?</h2>
          <p className="mx-auto mt-3 max-w-lg text-ink-3">Get in touch and we'll help you set up transparent, reliable service management for your workshop.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/contact')}>Contact Us</Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/register')}>Get Started</Button>
          </div>
        </motion.div>
      </Section>
    </>
  );
}
