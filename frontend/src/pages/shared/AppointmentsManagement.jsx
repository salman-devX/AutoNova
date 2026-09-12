import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, Wrench } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, RowActions } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { FilterBar, FilterDropdown } from '../../components/common/SearchAndFilter';
import { Loader } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { serviceOrderService } from '../../services/serviceOrderService';
import { formatDate } from '../../utils/format';

const STATUS_LABELS = {
  pending: 'Pending', confirmed: 'Confirmed', 'in-progress': 'In Progress',
  completed: 'Completed', cancelled: 'Cancelled', rescheduled: 'Rescheduled',
};

export default function AppointmentsManagement() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actingId, setActingId] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.list({});
      setAppointments(res.data || []);
    } catch (err) {
      toast({ type: 'error', title: 'Could not load appointments', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const confirm = async (appt) => {
    const id = appt._id || appt.id;
    setActingId(id);
    try {
      await appointmentService.confirm(id);
      toast({ type: 'success', title: 'Appointment confirmed' });
      load();
    } catch (err) {
      toast({ type: 'error', title: 'Could not confirm appointment', message: err.message });
    } finally {
      setActingId(null);
    }
  };

  const cancel = async (appt) => {
    const id = appt._id || appt.id;
    setActingId(id);
    try {
      await appointmentService.cancel(id, 'Cancelled by workshop staff');
      toast({ type: 'success', title: 'Appointment cancelled' });
      load();
    } catch (err) {
      toast({ type: 'error', title: 'Could not cancel appointment', message: err.message });
    } finally {
      setActingId(null);
    }
  };

  /** Once the customer's vehicle physically arrives, this turns the appointment into a trackable workshop job. */
  const startServiceOrder = async (appt) => {
    const id = appt._id || appt.id;
    setActingId(id);
    try {
      await serviceOrderService.create({
        customerId: appt.customerId?._id,
        vehicleId: appt.vehicleId?._id,
        appointmentId: id,
        services: appt.serviceId ? [{ serviceId: appt.serviceId._id }] : [],
      });
      toast({ type: 'success', title: 'Service order started', message: 'Find it under Service Orders to assign a mechanic.' });
      navigate(`/${user.role}/service-orders`);
    } catch (err) {
      toast({ type: 'error', title: 'Could not start service order', message: err.message });
    } finally {
      setActingId(null);
    }
  };

  const filtered = statusFilter ? appointments.filter((a) => a.status === statusFilter) : appointments;

  if (loading) return <Loader label="Loading appointments..." className="min-h-[50vh]" />;

  return (
    <div>
      <PageHeader title="Appointments" subtitle="All upcoming and past appointments across the workshop." />

      <Card className="mb-5">
        <FilterBar>
          <FilterDropdown label="All Statuses" value={statusFilter} onChange={setStatusFilter}
            options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))} />
        </FilterBar>
      </Card>

      <Card>
        <DataTable
          emptyLabel="No appointments found"
          columns={[
            { key: 'customer', header: 'Customer', render: (r) => r.customerId?.userId?.name || '—' },
            { key: 'vehicle', header: 'Vehicle', render: (r) => r.vehicleId ? `${r.vehicleId.make} ${r.vehicleId.model} — ${r.vehicleId.registrationNumber}` : '—' },
            { key: 'service', header: 'Service', render: (r) => r.serviceId?.name || '—' },
            { key: 'date', header: 'Date', render: (r) => `${formatDate(r.start)} · ${new Date(r.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={STATUS_LABELS[r.status] || r.status} /> },
            {
              key: 'actions', header: '', className: 'text-right',
              render: (r) => {
                const id = r._id || r.id;
                return (
                  <RowActions>
                    {r.status === 'pending' && (
                      <button
                        onClick={() => confirm(r)} disabled={actingId === id}
                        className="rounded-lg p-1.5 text-ink-muted hover:bg-emerald-400/10 hover:text-emerald-400 disabled:opacity-40"
                        aria-label="Confirm appointment"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    {r.status === 'confirmed' && (
                      <Button size="sm" variant="secondary" icon={Wrench} loading={actingId === id} onClick={() => startServiceOrder(r)}>
                        Start Service
                      </Button>
                    )}
                    {!['completed', 'cancelled', 'in-progress'].includes(r.status) && (
                      <button
                        onClick={() => cancel(r)}
                        disabled={actingId === id}
                        className="rounded-lg p-1.5 text-ink-muted hover:bg-rose-400/10 hover:text-rose-400 disabled:opacity-40"
                        aria-label="Cancel appointment"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </RowActions>
                );
              },
            },
          ]}
          data={filtered}
        />
      </Card>
    </div>
  );
}