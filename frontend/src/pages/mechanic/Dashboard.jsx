import { useEffect, useState } from 'react';
import { Wrench, Clock, CheckCircle2, AlertCircle, Car } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard, Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/Badge';
import { Loader, EmptyState } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { reportService } from '../../services/reportService';

const STATUS_LABELS = {
  booked: 'Booked', vehicle_received: 'Vehicle Received', inspection: 'Inspection',
  in_progress: 'In Progress', quality_check: 'Quality Check', ready_for_pickup: 'Ready for Pickup', completed: 'Completed',
};

export default function MechanicDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    reportService.getMechanicDashboard()
      .then(setStats)
      .catch((err) => toast({ type: 'error', title: 'Could not load dashboard', message: err.message }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard..." className="min-h-[50vh]" />;
  if (!stats) return null;

  return (
    <div>
      <PageHeader title="My Workbench" subtitle="Your assigned jobs and today's workload." />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard index={0} label="Assigned Jobs" value={stats.assignedJobs.length} icon={Wrench} accent="cyan" />
        <StatCard index={1} label="Pending" value={stats.pending} icon={AlertCircle} accent="amber" />
        <StatCard index={2} label="In Progress" value={stats.inProgress} icon={Clock} accent="blue" />
        <StatCard index={3} label="Completed Today" value={stats.completedToday} icon={CheckCircle2} accent="emerald" />
      </div>

      <div className="mt-6">
        {stats.assignedJobs.length === 0 ? (
          <EmptyState icon={Wrench} title="No active jobs" description="New assignments will appear here." />
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {stats.assignedJobs.map((job) => {
              const id = job._id;
              const vehicleLabel = job.vehicleId ? `${job.vehicleId.make} ${job.vehicleId.model} — ${job.vehicleId.registrationNumber}` : '';
              const customerName = job.customerId?.userId?.name || '';
              const serviceLabel = job.services?.map((s) => s.name).join(', ');
              return (
                <Card key={id} hover>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><Car className="h-5 w-5" /></div>
                      <div>
                        <p className="font-medium text-ink">{vehicleLabel}</p>
                        <p className="text-xs text-ink-muted">{customerName}</p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-ink-3">{serviceLabel}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <StatusBadge status={STATUS_LABELS[job.status] || job.status} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
