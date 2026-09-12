import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, LineChart, BellRing, ShieldCheck, Clock, Users, Package, Receipt, ClipboardCheck, Building2 } from 'lucide-react';
import Button from '../../components/common/Button';

const CUSTOMER_FEATURES = [
  { icon: LineChart, title: 'Live Service Tracking', desc: 'Watch your vehicle move through every stage of the workshop pipeline in real time.' },
  { icon: BellRing, title: 'Instant Notifications', desc: 'Know the moment your appointment is confirmed, inspection is done, or car is ready.' },
  { icon: Receipt, title: 'Transparent Invoices', desc: 'Itemized parts, labor, and tax — calculated automatically, never manually adjusted.' },
];

const WORKSHOP_FEATURES = [
  { icon: Clock, title: 'Conflict-Free Scheduling', desc: 'The booking engine prevents any two customers from landing on the same mechanic slot.' },
  { icon: ClipboardCheck, title: 'Digital Inspections', desc: 'Mechanics log a category-by-category checklist with photos, straight from the job.' },
  { icon: Package, title: 'Inventory That Stays Accurate', desc: 'Every part used on a job is deducted automatically, with a full audit trail and low-stock alerts.' },
  { icon: Users, title: 'Role-Based Access', desc: 'Customers, receptionists, mechanics, and admins each see exactly what they need — nothing more.' },
  { icon: Building2, title: 'Multi-Workshop Ready', desc: 'Running more than one branch? Each location\'s data stays completely separate and secure.' },
  { icon: ShieldCheck, title: 'Built-In Security', desc: 'Every request is authenticated and authorized server-side — not just hidden in the interface.' },
];

function FeatureGrid({ items }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.35, delay: i * 0.05 }}
          className="glass-card-hover"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/10 text-cyan-300">
            <f.icon className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-ink">{f.title}</h3>
          <p className="mt-1.5 text-sm text-ink-3">{f.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default function FeaturesPage() {
  const navigate = useNavigate();

  return (
    <>
      <section className="relative overflow-hidden pt-36 pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
            Platform Features
          </span>
          <h1 className="text-4xl font-bold sm:text-5xl">One platform, built for everyone in the workshop</h1>
          <p className="mt-4 text-lg text-ink-3">From the customer booking a service to the admin running multiple branches.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="mb-6 font-display text-2xl font-bold text-ink">For Customers</h2>
        <FeatureGrid items={CUSTOMER_FEATURES} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <h2 className="mb-6 font-display text-2xl font-bold text-ink">For the Workshop</h2>
        <FeatureGrid items={WORKSHOP_FEATURES} />
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-panel flex flex-col items-center gap-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 px-8 py-12 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">See it running in your workshop</h2>
          <p className="max-w-lg text-ink-3">Get in touch and we'll walk you through setting up your workshop on AutoNova.</p>
          <Button size="lg" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/contact')}>Contact Us</Button>
        </motion.div>
      </section>
    </>
  );
}
