import { useEffect, useState } from 'react';
import { ArrowRight, Receipt } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, RowActions } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Loader } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { serviceOrderService, NEXT_STATUS_MAP } from '../../services/serviceOrderService';
import { invoiceService } from '../../services/invoiceService';
import { formatCurrency } from '../../utils/format';

const STATUS_LABELS = {
  booked: 'Booked', vehicle_received: 'Vehicle Received', inspection: 'Inspection',
  in_progress: 'In Progress', quality_check: 'Quality Check', ready_for_pickup: 'Ready for Pickup', completed: 'Completed',
};

export default function ServiceOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advancingId, setAdvancingId] = useState(null);
  const [invoicingId, setInvoicingId] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await serviceOrderService.list({});
      setOrders(res.data || []);
    } catch (err) {
      toast({ type: 'error', title: 'Could not load service orders', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const advance = async (order) => {
    const id = order._id || order.id;
    setAdvancingId(id);
    try {
      await serviceOrderService.advanceStatus(id, order.status);
      toast({ type: 'success', title: `Moved to "${STATUS_LABELS[NEXT_STATUS_MAP[order.status]] || 'Completed'}"` });
      load();
    } catch (err) {
      toast({ type: 'error', title: 'Could not update status', message: err.message });
    } finally {
      setAdvancingId(null);
    }
  };

  const generateInvoice = async (order) => {
    const id = order._id || order.id;
    setInvoicingId(id);
    try {
      await invoiceService.create({ serviceOrderId: id });
      toast({ type: 'success', title: 'Invoice generated', message: 'Find it under Invoices to record payment.' });
    } catch (err) {
      toast({ type: 'error', title: 'Could not generate invoice', message: err.message });
    } finally {
      setInvoicingId(null);
    }
  };

  if (loading) return <Loader label="Loading service orders..." className="min-h-[50vh]" />;

  return (
    <div>
      <PageHeader title="Service Orders" subtitle="Track every vehicle moving through the workshop pipeline." />

      <Card>
        <DataTable
          emptyLabel="No service orders yet"
          columns={[
            { key: 'customer', header: 'Customer', render: (r) => r.customerId?.userId?.name || '—' },
            { key: 'vehicle', header: 'Vehicle', render: (r) => r.vehicleId ? `${r.vehicleId.make} ${r.vehicleId.model} — ${r.vehicleId.registrationNumber}` : '—' },
            { key: 'services', header: 'Service', render: (r) => r.services?.map((s) => s.name).join(', ') || '—' },
            { key: 'mechanic', header: 'Mechanic', render: (r) => r.assignedMechanics?.map((m) => m.userId?.name).filter(Boolean).join(', ') || 'Unassigned' },
            { key: 'estimatedCost', header: 'Est. Cost', render: (r) => formatCurrency(r.estimatedCost) },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={STATUS_LABELS[r.status] || r.status} /> },
            {
              key: 'actions', header: '', className: 'text-right',
              render: (r) => (
                <RowActions>
                  {(r.status === 'ready_for_pickup' || r.status === 'completed') && (
                    <Button
                      size="sm" variant="secondary" icon={Receipt}
                      loading={invoicingId === (r._id || r.id)}
                      onClick={() => generateInvoice(r)}
                    >
                      Invoice
                    </Button>
                  )}
                  {r.status !== 'completed' && r.status !== 'cancelled' ? (
                    <Button
                      size="sm" variant="secondary" icon={ArrowRight} iconPosition="right"
                      loading={advancingId === (r._id || r.id)}
                      onClick={() => advance(r)}
                    >
                      {STATUS_LABELS[NEXT_STATUS_MAP[r.status]] || 'Complete'}
                    </Button>
                  ) : r.status === 'cancelled' ? (
                    <span className="text-xs text-ink-faint">Cancelled</span>
                  ) : null}
                </RowActions>
              ),
            },
          ]}
          data={orders}
        />
      </Card>
    </div>
  );
}
