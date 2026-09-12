import { useEffect, useState } from 'react';
import { CalendarPlus, Car, Wrench, Clock, X } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Select } from '../../components/common/FormFields';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';
import { Loader, EmptyState, SkeletonCard } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { appointmentService } from '../../services/appointmentService';
import { vehicleService } from '../../services/vehicleService';
import { catalogService } from '../../services/catalogService';
import { formatDate } from '../../utils/format';
import { cn } from '../../utils/cn';

const STEPS = ['Vehicle & Service', 'Pick a Date', 'Pick a Time'];

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookOpen, setBookOpen] = useState(false);
  const { toast } = useToast();

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

  return (
    <div>
      <PageHeader title="Appointments" subtitle="Book a new service or track existing appointments." action={<Button icon={CalendarPlus} onClick={() => setBookOpen(true)}>Book Appointment</Button>} />

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : appointments.length === 0 ? (
        <EmptyState icon={CalendarPlus} title="No appointments yet" description="Book your first service appointment." action={<Button icon={CalendarPlus} onClick={() => setBookOpen(true)}>Book Appointment</Button>} />
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => {
            const id = a._id || a.id;
            const vehicleLabel = a.vehicleId ? `${a.vehicleId.make} ${a.vehicleId.model} — ${a.vehicleId.registrationNumber}` : '';
            return (
              <Card key={id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><Wrench className="h-5 w-5" /></div>
                    <div>
                      <p className="font-medium text-ink">{a.serviceId?.name}</p>
                      <p className="text-sm text-ink-muted">{vehicleLabel} · {formatDate(a.start)} at {new Date(a.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <BookAppointmentModal open={bookOpen} onClose={() => setBookOpen(false)} onBooked={() => { setBookOpen(false); load(); }} />
    </div>
  );
}

function BookAppointmentModal({ open, onClose, onBooked }) {
  const [step, setStep] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [workshopId, setWorkshopId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setStep(0); setVehicleId(''); setServiceId(''); setDate(''); setSlots([]); setSelectedSlot(null);
    setVehicles([]); setServices([]); setWorkshopId('');

    vehicleService.list({}).then((res) => {
      const list = res.data || [];
      setVehicles(list);
      // A customer's vehicles all belong to the same workshop they registered under.
      const wsId = list[0]?.workshopId;
      if (wsId) {
        setWorkshopId(wsId);
        catalogService.list({ workshopId: wsId }).then((r) => setServices(r.data || []));
      }
    });
  }, [open]);

  const loadSlots = async (selectedDate) => {
    setSlotsLoading(true);
    try {
      const res = await appointmentService.getAvailability({ date: selectedDate, serviceId, workshopId });
      setSlots(res.slots || []);
    } catch (err) {
      toast({ type: 'error', title: 'Could not load availability', message: err.message });
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDateChange = (d) => {
    setDate(d);
    setSelectedSlot(null);
    if (d) { loadSlots(d); setStep(2); }
  };

  const confirmBooking = async () => {
    setBooking(true);
    try {
      await appointmentService.create({
        workshopId, vehicleId, serviceId, start: selectedSlot.start,
      });
      toast({ type: 'success', title: 'Appointment requested', message: 'You\'ll be notified once it\'s confirmed.' });
      onBooked();
    } catch (err) {
      toast({ type: 'error', title: 'Booking failed', message: err.message });
    } finally {
      setBooking(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <Modal open={open} onClose={onClose} title="Book an Appointment" size="lg">
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', i <= step ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950' : 'bg-glass-1 text-ink-muted')}>
              {i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={cn('h-px flex-1', i < step ? 'bg-cyan-400/50' : 'bg-glass-3')} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <Select label="Vehicle" required placeholder="Select your vehicle" value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            options={vehicles.map((v) => ({ value: v._id || v.id, label: `${v.make} ${v.model} — ${v.registrationNumber || v.reg}` }))} />
          <Select label="Service" required placeholder="Select a service" value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            options={services.map((s) => ({ value: s._id || s.id, label: `${s.name} (${s.durationMinutes} min)` }))} />
          {vehicles.length > 0 && services.length === 0 && (
            <p className="text-sm text-ink-muted">No services are set up for your workshop yet — ask an admin to add some.</p>
          )}
          <div className="flex justify-end pt-2">
            <Button disabled={!vehicleId || !serviceId} onClick={() => setStep(1)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <label className="mb-1.5 block text-sm font-medium text-ink-2">Preferred date</label>
          <input type="date" min={minDate} value={date} onChange={(e) => handleDateChange(e.target.value)} className="input-base" />
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="mb-3 text-sm text-ink-3">Available times for {date && formatDate(date)}</p>
          {slotsLoading ? (
            <Loader label="Loading availability..." />
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => {
                const time = new Date(slot.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                const isSelected = selectedSlot?.start === slot.start;
                return (
                  <button
                    key={slot.start}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                      !slot.available && 'cursor-not-allowed border-hairline-1 text-ink-faint line-through',
                      slot.available && !isSelected && 'border-hairline-2 text-ink-2 hover:border-cyan-400/40 hover:bg-glass-1',
                      isSelected && 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                    )}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button disabled={!selectedSlot} loading={booking} onClick={confirmBooking}>Confirm Booking</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
