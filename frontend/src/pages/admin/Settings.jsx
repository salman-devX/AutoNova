import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Clock, Percent } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Select } from '../../components/common/FormFields';
import { Loader } from '../../components/common/States';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { workshopService } from '../../services/workshopService';

const DAYS = [
  { value: 'mon', label: 'Mon' }, { value: 'tue', label: 'Tue' }, { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' }, { value: 'fri', label: 'Fri' }, { value: 'sat', label: 'Sat' }, { value: 'sun', label: 'Sun' },
];

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [closedDays, setClosedDays] = useState([]);
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      workshopName: '', city: '', taxPercent: 5, currency: 'PKR',
      appointmentStep: 30, defaultDuration: 60, openTime: '09:00', closeTime: '18:00',
    },
  });

  useEffect(() => {
    if (!user?.workshopId) { setLoading(false); return; }
    workshopService.getById(user.workshopId)
      .then((w) => {
        const mondayHours = w.workingHours?.find((d) => !d.isClosed) || {};
        reset({
          workshopName: w.name || '', city: w.address?.city || '',
          taxPercent: w.settings?.taxPercent ?? 5, currency: w.settings?.currency || 'PKR',
          appointmentStep: w.settings?.appointmentStepMinutes ?? 30, defaultDuration: w.settings?.defaultServiceDurationMinutes ?? 60,
          openTime: mondayHours.open || '09:00', closeTime: mondayHours.close || '18:00',
        });
        setClosedDays((w.workingHours || []).filter((d) => d.isClosed).map((d) => d.day));
      })
      .catch((err) => toast({ type: 'error', title: 'Could not load settings', message: err.message }))
      .finally(() => setLoading(false));
  }, [user?.workshopId]);

  const toggleDay = (day) => {
    setClosedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const workingHours = DAYS.map(({ value: day }) => ({
        day, open: data.openTime, close: data.closeTime, isClosed: closedDays.includes(day),
      }));
      await workshopService.update(user.workshopId, {
        name: data.workshopName,
        city: data.city,
        settings: {
          taxPercent: Number(data.taxPercent), currency: data.currency,
          appointmentStepMinutes: Number(data.appointmentStep), defaultServiceDurationMinutes: Number(data.defaultDuration),
        },
        workingHours,
      });
      toast({ type: 'success', title: 'Settings saved' });
    } catch (err) {
      toast({ type: 'error', title: 'Could not save settings', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading settings..." className="min-h-[50vh]" />;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Workshop business configuration." action={<Button loading={saving} onClick={handleSubmit(onSubmit)}>Save Changes</Button>} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-cyan-400" />
            <h3 className="font-display font-semibold text-ink">Workshop Details</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Workshop name" {...register('workshopName')} />
            <Input label="City" {...register('city')} />
          </div>
          <div className="mt-4">
            <Select label="Currency" options={[{ value: 'PKR', label: 'PKR — Pakistani Rupee' }, { value: 'USD', label: 'USD — US Dollar' }]} {...register('currency')} />
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <h3 className="font-display font-semibold text-ink">Working Hours</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Opening time" type="time" {...register('openTime')} />
            <Input label="Closing time" type="time" {...register('closeTime')} />
          </div>
          <p className="mb-2 mt-4 text-sm font-medium text-ink-2">Closed days</p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(({ value, label }) => (
              <button
                type="button" key={value} onClick={() => toggleDay(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${closedDays.includes(value) ? 'bg-rose-400/10 text-rose-300 border border-rose-400/20' : 'glass text-ink-3 hover:text-ink'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Percent className="h-4 w-4 text-cyan-400" />
            <h3 className="font-display font-semibold text-ink">Appointments & Billing</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Slot step (min)" type="number" {...register('appointmentStep')} />
            <Input label="Default duration (min)" type="number" {...register('defaultDuration')} />
            <Input label="Tax rate (%)" type="number" {...register('taxPercent')} />
          </div>
        </Card>
      </form>
    </div>
  );
}
