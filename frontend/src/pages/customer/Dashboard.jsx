import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, CalendarPlus, Receipt, Wrench, MapPin, Clock } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard, Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/Badge';
import { Loader } from '../../components/common/States';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { reportService } from '../../services/reportService';
import { formatCurrency, formatDate } from '../../utils/format';

const SERVICE_ORDER_STATUS_LABELS = {
  booked: 'Booked', vehicle_received: 'Vehicle Received', inspection: 'Inspection',
  in_progress: 'In Progress', quality_check: 'Quality Check', ready_for_pickup: 'Ready for Pickup', completed: 'Completed',
};
const APPOINTMENT_STATUS_LABELS = {
  pending: 'Pending', confirmed: 'Confirmed', 'in-progress': 'In Progress', completed: 'Completed', cancelled: 'Cancelled',
};
const INVOICE_STATUS_LABELS = { unpaid: 'Unpaid', partially_paid: 'Partial', paid: 'Paid', cancelled: 'Cancelled' };

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getCustomerDashboard()
      .then(setStats)
      .catch((err) => toast({ type: 'error', title: 'Could not load dashboard', message: err.message }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard..." className="min-h-[50vh]" />;
  if (!stats) return null;

  const { activeServiceOrder, upcomingAppointment, recentInvoices, vehicles } = stats;
  const unpaidCount = recentInvoices.filter((i) => i.paymentStatus !== 'paid').length;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle="Here's what's happening with your vehicles today."
        action={<Button icon={CalendarPlus} onClick={() => navigate('/customer/appointments')}>Book Appointment</Button>}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard index={0} label="My Vehicles" value={vehicles.length} icon={Car} accent="cyan" />
        <StatCard index={1} label="Upcoming Appointments" value={upcomingAppointment ? 1 : 0} icon={CalendarPlus} accent="blue" />
        <StatCard index={2} label="Active Service" value={activeServiceOrder ? 1 : 0} icon={Wrench} accent="emerald" />
        <StatCard index={3} label="Unpaid Invoices" value={unpaidCount} icon={Receipt} accent="amber" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-ink">Active Service</h3>
            {activeServiceOrder && <StatusBadge status={SERVICE_ORDER_STATUS_LABELS[activeServiceOrder.status] || activeServiceOrder.status} />}
          </div>
          {activeServiceOrder ? (
            <div className="mt-4">
              <p className="font-medium text-ink-2">
                {activeServiceOrder.vehicleId ? `${activeServiceOrder.vehicleId.make} ${activeServiceOrder.vehicleId.model} — ${activeServiceOrder.vehicleId.registrationNumber}` : ''}
              </p>
              <p className="text-sm text-ink-muted">{activeServiceOrder.services?.map((s) => s.name).join(', ')}</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/customer/service-history')}>View Details</Button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-muted">No vehicle is currently in service.</p>
          )}
        </Card>

        <Card>
          <h3 className="font-display font-semibold text-ink">Upcoming Appointment</h3>
          {upcomingAppointment ? (
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-ink-2"><Wrench className="h-4 w-4 text-cyan-400" /> {upcomingAppointment.serviceId?.name}</div>
              <div className="flex items-center gap-2 text-ink-2">
                <Car className="h-4 w-4 text-cyan-400" />
                {upcomingAppointment.vehicleId ? `${upcomingAppointment.vehicleId.make} ${upcomingAppointment.vehicleId.model}` : ''}
              </div>
              <div className="flex items-center gap-2 text-ink-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                {formatDate(upcomingAppointment.start)} · {new Date(upcomingAppointment.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </div>
              <div className="flex items-center gap-2 text-ink-2"><MapPin className="h-4 w-4 text-cyan-400" /> AutoNova Lahore</div>
              <StatusBadge status={APPOINTMENT_STATUS_LABELS[upcomingAppointment.status] || upcomingAppointment.status} className="mt-1" />
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-muted">No upcoming appointments.</p>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display font-semibold text-ink">My Vehicles</h3>
            <button onClick={() => navigate('/customer/vehicles')} className="text-xs font-medium text-cyan-400 hover:text-cyan-300">View all</button>
          </div>
          <div className="space-y-3">
            {vehicles.length === 0 && <p className="text-sm text-ink-muted">No vehicles registered yet.</p>}
            {vehicles.map((v) => (
              <div key={v._id} className="flex items-center justify-between rounded-xl bg-glass-1 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300"><Car className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-medium text-ink-2">{v.make} {v.model} ({v.year})</p>
                    <p className="text-xs text-ink-muted">{v.registrationNumber} · {Number(v.mileage || 0).toLocaleString()} km</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display font-semibold text-ink">Recent Invoices</h3>
            <button onClick={() => navigate('/customer/invoices')} className="text-xs font-medium text-cyan-400 hover:text-cyan-300">View all</button>
          </div>
          <div className="space-y-3">
            {recentInvoices.length === 0 && <p className="text-sm text-ink-muted">No invoices yet.</p>}
            {recentInvoices.map((inv) => (
              <div key={inv._id} className="flex items-center justify-between rounded-xl bg-glass-1 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-400/10 text-blue-300"><Receipt className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-medium text-ink-2">{inv.invoiceNumber}</p>
                    <p className="text-xs text-ink-muted">{formatDate(inv.issueDate)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink">{formatCurrency(inv.total)}</p>
                  <StatusBadge status={INVOICE_STATUS_LABELS[inv.paymentStatus] || inv.paymentStatus} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
