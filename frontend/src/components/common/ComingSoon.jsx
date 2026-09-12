import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import { PageHeader } from './PageHeader';

/**
 * Placeholder for pages scheduled in the next build phases (see project roadmap).
 * Keeps routing/navigation fully functional while deeper CRUD screens are built out.
 */
export default function ComingSoon({ title, note }) {
  return (
    <div>
      <PageHeader title={title} subtitle="This screen is scheduled for the next build phase." />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-hairline-2 py-24 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <Construction className="h-6 w-6" />
        </div>
        <p className="font-display font-semibold text-ink">Coming up next</p>
        <p className="max-w-sm text-sm text-ink-muted">{note || `${title} will be built in the following development phase, following the same design system.`}</p>
      </motion.div>
    </div>
  );
}
