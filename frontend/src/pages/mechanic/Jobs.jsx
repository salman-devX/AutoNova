import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, ArrowRight, ClipboardCheck, Car } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Loader, EmptyState } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { serviceOrderService, NEXT_STATUS_MAP } from '../../services/serviceOrderService';
import { formatCurrency } from '../../utils/format';

const STATUS_LABELS = {
  booked: 'Booked', vehicle_received: 'Vehicle Received', inspection: 'Inspection',
  in_progress: 'In Progress', quality_check: 'Quality Check', ready_for_pickup: 'Ready for Pickup', completed: 'Completed',
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advancingId, setAdvancingId] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await serviceOrderService.list({});
      setJobs((res.data || []).filter((j) => j.status !== 'completed'));
    } catch (err) {
      toast({ type: 'error', title: 'Could not load jobs', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const advance = async (job) => {
    const id = job._id || job.id;
    setAdvancingId(id);
    try {
      await serviceOrderService.advanceStatus(id, job.status);
      toast({ type: 'success', title: `Moved to "${STATUS_LABELS[NEXT_STATUS_MAP[job.status]] || 'Completed'}"` });
      load();
    } catch (err) {
      toast({ type: 'error', title: 'Could not update status', message: err.message });
    } finally {
      setAdvancingId(null);
    }
  };

  if (loading) return <Loader label="Loading your jobs..." className="min-h-[50vh]" />;

  return (
    <div>
      <PageHeader title="My Jobs" subtitle="Vehicles currently assigned to you." />

      {jobs.length === 0 ? (
        <EmptyState icon={Wrench} title="No active jobs" description="New assignments will appear here." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {jobs.map((job) => {
            const id = job._id || job.id;
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
                  <StatusBadge status={STATUS_LABELS[job.status] || job.status} />
                </div>
                <p className="mt-4 text-sm text-ink-3">{serviceLabel}</p>
                {job.complaint && <p className="mt-1 text-xs text-ink-muted">"{job.complaint}"</p>}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">{formatCurrency(job.estimatedCost)}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" icon={ClipboardCheck} onClick={() => navigate('/mechanic/inspections', { state: { serviceOrderId: id, vehicleId: job.vehicleId?._id } })}>Inspect</Button>
                    <Button size="sm" icon={ArrowRight} iconPosition="right" loading={advancingId === id} onClick={() => advance(job)}>
                      {STATUS_LABELS[NEXT_STATUS_MAP[job.status]] || 'Complete'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
