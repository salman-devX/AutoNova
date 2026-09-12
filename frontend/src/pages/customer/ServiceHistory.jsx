import { useEffect, useState } from 'react';
import { History, Wrench, Car, Calendar } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/Badge';
import { Loader, EmptyState } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { serviceOrderService } from '../../services/serviceOrderService';
import { formatCurrency, formatDate } from '../../utils/format';

const STATUS_LABELS = {
  booked: 'Booked', vehicle_received: 'Vehicle Received', inspection: 'Inspection',
  in_progress: 'In Progress', quality_check: 'Quality Check', ready_for_pickup: 'Ready for Pickup',
  completed: 'Completed', cancelled: 'Cancelled',
};

export default function ServiceHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    serviceOrderService.list({})
      .then((res) => setOrders(res.data || []))
      .catch((err) => toast({ type: 'error', title: 'Could not load service history', message: err.message }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading service history..." className="min-h-[50vh]" />;

  return (
    <div>
      <PageHeader title="Service History" subtitle="Every service performed on your vehicles." />

      {orders.length === 0 ? (
        <EmptyState icon={History} title="No service history yet" description="Completed services will appear here." />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const id = o._id || o.id;
            const vehicleLabel = o.vehicleId ? `${o.vehicleId.make} ${o.vehicleId.model} — ${o.vehicleId.registrationNumber}` : '';
            const serviceLabel = o.services?.map((s) => s.name).join(', ') || 'Service';
            const mechanicNames = o.assignedMechanics?.map((m) => m.userId?.name).filter(Boolean).join(', ') || 'Unassigned';
            return (
              <Card key={id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><Wrench className="h-5 w-5" /></div>
                    <div>
                      <p className="font-medium text-ink">{serviceLabel}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                        <span className="flex items-center gap-1"><Car className="h-3.5 w-3.5" /> {vehicleLabel}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(o.createdAt)}</span>
                        <span>Mechanic: {mechanicNames}</span>
                      </div>
                      {o.complaint && <p className="mt-2 text-xs text-ink-muted">"{o.complaint}"</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-semibold text-ink">{formatCurrency(o.estimatedCost)}</p>
                    <StatusBadge status={STATUS_LABELS[o.status] || o.status} className="mt-1.5" />
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
