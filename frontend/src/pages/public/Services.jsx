import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import Button from '../../components/common/Button';
import { services } from '../../data/mockLanding';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: Math.min(i * 0.05, 0.4), ease: [0.16, 1, 0.3, 1] } }),
};

export default function ServicesPage() {
  const navigate = useNavigate();

  return (
    <>
      <section className="relative overflow-hidden pt-36 pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.span
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300"
          >
            Our Services
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-4xl font-bold sm:text-5xl">
            Everything your vehicle needs
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-lg text-ink-3">
            Transparent, upfront pricing for every service — no surprise charges when you pick up your car.
          </motion.p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} custom={i} variants={fadeUp}
              className="glass-card-hover flex flex-col"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/10 text-cyan-300">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 flex-1 text-sm text-ink-3">{s.desc}</p>
              <div className="mt-4 flex items-center justify-between border-t border-hairline-2 pt-4">
                <span className="flex items-center gap-1.5 text-xs text-ink-muted"><Clock className="h-3.5 w-3.5" /> {s.duration}</span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-gradient"><Tag className="h-3.5 w-3.5 text-cyan-400" /> {s.price}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-panel mt-16 flex flex-col items-center gap-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 px-8 py-12 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Don't see what you're looking for?</h2>
          <p className="max-w-lg text-ink-3">Every workshop's needs are different — book a general service and our team will scope out anything else your vehicle needs.</p>
          <Button size="lg" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/register')}>Book a Service</Button>
        </motion.div>
      </section>
    </>
  );
}
