import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Textarea } from '../../components/common/FormFields';
import { useToast } from '../../context/ToastContext';
import { mockDelay } from '../../services/apiClient';

const CONTACT_DETAILS = [
  { icon: Mail, label: 'Email', value: 'salmanahmad5962@gmail.com', href: 'mailto:salmanahmad5962@gmail.com' },
  { icon: Phone, label: 'Phone', value: '+(92) 312 1634432', href: 'tel:+923121634432' },
  { icon: Clock, label: 'Response Time', value: 'Usually within 24 hours', href: null },
];

export default function ContactPage() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await mockDelay(700);
    setSending(false);
    setSent(true);
    toast({ type: 'success', title: 'Message sent', message: 'We\'ll get back to you shortly.' });
  };

  return (
    <section className="relative overflow-hidden pt-36 pb-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
          Contact Us
        </span>
        <h1 className="text-4xl font-bold sm:text-5xl">Let's get your workshop set up</h1>
        <p className="mt-4 text-lg text-ink-3">Questions about AutoNova, pricing, or getting your workshop onboarded? Reach out directly or send a message below.</p>
      </div>

      <div className="relative mx-auto mt-14 grid max-w-5xl gap-6 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="glass-panel space-y-5 p-6 lg:col-span-2"
        >
          <h2 className="font-display text-lg font-semibold text-ink">Get in touch</h2>
          {CONTACT_DETAILS.map((c) => (
            <div key={c.label} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <c.icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs text-ink-muted">{c.label}</p>
                {c.href ? (
                  <a href={c.href} className="text-sm font-medium text-ink hover:text-cyan-300">{c.value}</a>
                ) : (
                  <p className="text-sm font-medium text-ink">{c.value}</p>
                )}
              </div>
            </div>
          ))}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xs text-ink-muted">Based in</p>
              <p className="text-sm font-medium text-ink">Lahore, Pakistan</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="glass-panel p-6 lg:col-span-3"
        >
          {sent ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">Message sent</h3>
              <p className="mt-1.5 text-sm text-ink-3">Thanks for reaching out — we'll reply to your email shortly.</p>
              <Button variant="secondary" className="mt-6" onClick={() => setSent(false)}>Send another message</Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Your name" placeholder="Full name" required />
                <Input label="Email address" type="email" placeholder="you@example.com" required />
              </div>
              <Input label="Workshop name" placeholder="(Optional) Your workshop's name" />
              <Textarea label="Message" placeholder="Tell us a bit about your workshop and what you're looking for..." rows={5} required />
              <Button type="submit" className="w-full" icon={Send} loading={sending}>Send Message</Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
