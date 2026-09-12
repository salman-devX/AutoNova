import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Car, ClipboardList, Receipt, UserPlus, ClipboardPlus, FileText } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard, Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/Badge';
import { DataTable } from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import { Loader } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { reportService } from '../../services/reportService';

const STATUS_LABELS = {
  pending: 'Pending', confirmed: 'Confirmed', 'in-progress': 'In Progress',
  completed: 'Completed', cancelled: 'Cancelled', rescheduled: 'Rescheduled',
};

const QUICK_ACTIONS = [
  { icon: CalendarClock, label: 'Manage Appointments', to: '/receptionist/appointments' },
  { icon: Car, label: 'Customers', to: '/receptionist/customers' },
  { icon: ClipboardPlus, label: 'Service Orders', to: '/receptionist/service-orders' },
  { icon: FileText, label: 'Invoices', to: '/receptionist/invoices' },
];

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    reportService.getReceptionistDashboard()
      .then(setStats)
      .catch((err) => toast({ type: 'error', title: 'Could not load dashboard', message: err.message }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard..." className="min-h-[50vh]" />;
  if (!stats) return null;

  return (
    <div>
      <PageHeader title="Front Desk" subtitle="Today's workshop activity at a glance." />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard index={0} label="Today's Appointments" value={stats.todaysAppointments.length} icon={CalendarClock} accent="cyan" />
        <StatCard index={1} label="Pending Approval" value={stats.pendingAppointments} icon={ClipboardList} accent="amber" />
        <StatCard index={2} label="Vehicles In Workshop" value={stats.vehiclesInWorkshop} icon={Car} accent="blue" />
        <StatCard index={3} label="Pending Invoices" value={stats.pendingInvoices} icon={Receipt} accent="rose" />
      </div>

      <Card className="mt-6">
        <h3 className="mb-4 font-display font-semibold text-ink">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.to)}
              className="flex flex-col items-center gap-2 rounded-xl bg-glass-1 p-4 text-center transition-colors hover:bg-glass-3 hover:border-cyan-400/30 border border-transparent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><a.icon className="h-5 w-5" /></div>
              <span className="text-xs font-medium text-ink-2">{a.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display font-semibold text-ink">Today's Appointments</h3>
          <Button size="sm" variant="secondary" icon={UserPlus} onClick={() => navigate('/receptionist/appointments')}>View All</Button>
        </div>
        <DataTable
          emptyLabel="No appointments today"
          columns={[
            { key: 'customer', header: 'Customer', render: (r) => r.customerId?.userId?.name || '—' },
            { key: 'vehicle', header: 'Vehicle', render: (r) => r.vehicleId ? `${r.vehicleId.make} ${r.vehicleId.model} — ${r.vehicleId.registrationNumber}` : '—' },
            { key: 'service', header: 'Service', render: (r) => r.serviceId?.name || '—' },
            { key: 'time', header: 'Time', render: (r) => new Date(r.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={STATUS_LABELS[r.status] || r.status} /> },
          ]}
          data={stats.todaysAppointments}
        />
      </Card>
    </div>
  );
}
