import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Building2, Pencil } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { workshopService } from '../../services/workshopService';

export default function Workshops() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = () => {
    setLoading(true);
    workshopService.list({}).then((res) => setWorkshops(res.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); reset({ name: '', city: '', phone: '', email: '' }); setModalOpen(true); };
  const openEdit = (w) => { setEditing(w); reset({ name: w.name, city: w.address?.city || '', phone: w.phone || '', email: w.email || '' }); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) await workshopService.update(editing._id || editing.id, data);
      else await workshopService.create(data);
      toast({ type: 'success', title: editing ? 'Workshop updated' : 'Workshop created' });
      setModalOpen(false);
      load();
    } catch (err) {
      toast({ type: 'error', title: 'Save failed', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading workshops..." className="min-h-[50vh]" />;

  return (
    <div>
      <PageHeader title="Workshops" subtitle="Manage every workshop location on AutoHubX." action={<Button icon={Plus} onClick={openAdd}>Add Workshop</Button>} />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {workshops.map((w) => (
          <Card key={w._id || w.id} hover>
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><Building2 className="h-5 w-5" /></div>
              <button onClick={() => openEdit(w)} className="rounded-lg p-1.5 text-ink-muted hover:bg-glass-1 hover:text-cyan-300"><Pencil className="h-4 w-4" /></button>
            </div>
            <p className="mt-4 font-display font-semibold text-ink">{w.name}</p>
            <p className="text-sm text-ink-muted">{w.address?.city}</p>
            <div className="mt-3 flex items-center justify-end">
              <StatusBadge status={w.isActive ? 'active' : 'inactive'} />
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Workshop' : 'Add Workshop'}
        footer={<>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit(onSubmit)}>{editing ? 'Save Changes' : 'Create Workshop'}</Button>
        </>}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Workshop name" required error={errors.name?.message} {...register('name', { required: 'Required' })} />
          <Input label="City" required error={errors.city?.message} {...register('city', { required: 'Required' })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" {...register('phone')} />
            <Input label="Email" type="email" {...register('email')} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
