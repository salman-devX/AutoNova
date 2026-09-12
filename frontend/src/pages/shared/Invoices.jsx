import { useEffect, useState } from 'react';
import { Printer, CreditCard } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { invoiceService } from '../../services/invoiceService';
import { formatCurrency, formatDate } from '../../utils/format';

const STATUS_LABELS = { unpaid: 'Unpaid', partially_paid: 'Partial', paid: 'Paid', cancelled: 'Cancelled' };

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [paying, setPaying] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const canRecordPayment = user?.role === 'receptionist' || user?.role === 'admin';

  const load = async () => {
    setLoading(true);
    try {
      const res = await invoiceService.list({});
      setInvoices(res.data || []);
    } catch (err) {
      toast({ type: 'error', title: 'Could not load invoices', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const recordPayment = async () => {
    setPaying(true);
    try {
      await invoiceService.recordPayment({
        invoiceId: selected._id || selected.id,
        amount: selected.balanceDue ?? selected.total,
        method: 'cash',
      });
      toast({ type: 'success', title: 'Payment recorded' });
      setSelected(null);
      load();
    } catch (err) {
      toast({ type: 'error', title: 'Could not record payment', message: err.message });
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <Loader label="Loading invoices..." className="min-h-[50vh]" />;

  return (
    <div>
      <PageHeader title="Invoices" subtitle="Billing history and payment status." />

      <Card>
        <DataTable
          emptyLabel="No invoices yet"
          onRowClick={setSelected}
          columns={[
            { key: 'invoiceNumber', header: 'Invoice #' },
            { key: 'vehicle', header: 'Vehicle', render: (r) => r.vehicleId ? `${r.vehicleId.make} ${r.vehicleId.model} — ${r.vehicleId.registrationNumber}` : '—' },
            { key: 'issueDate', header: 'Date', render: (r) => formatDate(r.issueDate) },
            { key: 'total', header: 'Total', render: (r) => formatCurrency(r.total) },
            { key: 'paymentStatus', header: 'Status', render: (r) => <StatusBadge status={STATUS_LABELS[r.paymentStatus] || r.paymentStatus} /> },
          ]}
          data={invoices}
        />
      </Card>

      <Modal
        open={!!selected} onClose={() => setSelected(null)}
        title={selected?.invoiceNumber} description="Invoice details"
        footer={<>
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
          {canRecordPayment && selected?.paymentStatus !== 'paid' && selected?.paymentStatus !== 'cancelled' && (
            <Button icon={CreditCard} loading={paying} onClick={recordPayment}>Record Payment</Button>
          )}
        </>}
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-glass-1 p-3 text-sm">
              <div>
                <p className="text-ink-muted">Customer</p>
                <p className="font-medium text-ink">{selected.customerId?.userId?.name || '—'}</p>
              </div>
              <div className="text-right">
                <p className="text-ink-muted">Vehicle</p>
                <p className="font-medium text-ink">{selected.vehicleId ? `${selected.vehicleId.make} ${selected.vehicleId.model}` : '—'}</p>
              </div>
            </div>
            <div className="space-y-2 rounded-xl border border-hairline-2 p-4 text-sm">
              <div className="flex justify-between text-ink-3"><span>Subtotal</span><span>{formatCurrency(selected.subtotal)}</span></div>
              <div className="flex justify-between text-ink-3"><span>Tax</span><span>{formatCurrency(selected.taxAmount || 0)}</span></div>
              <div className="flex justify-between text-ink-3"><span>Discount</span><span>-{formatCurrency(selected.discount || 0)}</span></div>
              <div className="my-2 h-px bg-glass-3" />
              <div className="flex justify-between font-display text-base font-semibold text-ink"><span>Total</span><span>{formatCurrency(selected.total)}</span></div>
              {selected.balanceDue > 0 && (
                <div className="flex justify-between text-amber-400"><span>Balance Due</span><span>{formatCurrency(selected.balanceDue)}</span></div>
              )}
            </div>
            <StatusBadge status={STATUS_LABELS[selected.paymentStatus] || selected.paymentStatus} />
          </div>
        )}
      </Modal>
    </div>
  );
}
