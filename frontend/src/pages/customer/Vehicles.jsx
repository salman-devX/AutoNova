import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Car, Pencil, Trash2, Gauge } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { Loader, EmptyState, SkeletonCard } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { vehicleService } from '../../services/vehicleService';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await vehicleService.list({});
      setVehicles(res.data || []);
    } catch (err) {
      toast({ type: 'error', title: 'Could not load vehicles', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); reset({ make: '', model: '', year: '', registrationNumber: '', mileage: '', color: '' }); setModalOpen(true); };
  const openEdit = (v) => { setEditing(v); reset({ ...v, registrationNumber: v.registrationNumber || v.reg }); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await vehicleService.update(editing._id || editing.id, data);
        toast({ type: 'success', title: 'Vehicle updated' });
      } else {
        await vehicleService.create(data);
        toast({ type: 'success', title: 'Vehicle added' });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast({ type: 'error', title: 'Save failed', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setSaving(true);
    try {
      await vehicleService.remove(deleteTarget._id || deleteTarget.id);
      toast({ type: 'success', title: 'Vehicle removed' });
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast({ type: 'error', title: 'Could not remove vehicle', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="My Vehicles" subtitle="Manage the vehicles registered to your account." action={<Button icon={Plus} onClick={openAdd}>Add Vehicle</Button>} />

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState icon={Car} title="No vehicles yet" description="Add your first vehicle to start booking services." action={<Button icon={Plus} onClick={openAdd}>Add Vehicle</Button>} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <Card key={v._id || v.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><Car className="h-5 w-5" /></div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(v)} className="rounded-lg p-1.5 text-ink-muted hover:bg-glass-1 hover:text-cyan-300"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteTarget(v)} className="rounded-lg p-1.5 text-ink-muted hover:bg-rose-400/10 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="mt-4 font-display font-semibold text-ink">{v.make} {v.model} {v.year && `(${v.year})`}</p>
              <p className="text-sm text-ink-muted">{v.reg || v.registrationNumber}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
                <Gauge className="h-3.5 w-3.5" /> {Number(v.mileage || 0).toLocaleString()} km · {v.color}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Vehicle' : 'Add Vehicle'}
        footer={<>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit(onSubmit)}>{editing ? 'Save Changes' : 'Add Vehicle'}</Button>
        </>}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Make" required error={errors.make?.message} {...register('make', { required: 'Required' })} />
            <Input label="Model" required error={errors.model?.message} {...register('model', { required: 'Required' })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Year" type="number" {...register('year')} />
            <Input label="Color" {...register('color')} />
          </div>
          <Input label="Registration Number" required error={errors.registrationNumber?.message} {...register('registrationNumber', { required: 'Required' })} />
          <Input label="Mileage (km)" type="number" {...register('mileage')} />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={saving}
        title="Remove this vehicle?"
        description={deleteTarget ? `${deleteTarget.make} ${deleteTarget.model} (${deleteTarget.reg || deleteTarget.registrationNumber}) will be removed from your account.` : ''}
        confirmLabel="Remove"
      />
    </div>
  );
}
