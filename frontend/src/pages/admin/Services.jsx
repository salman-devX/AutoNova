import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Wrench, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, RowActions } from '../../components/common/DataTable';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Select } from '../../components/common/FormFields';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { Loader } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { catalogService } from '../../services/catalogService';
import { formatCurrency } from '../../utils/format';

const CATEGORIES = ['general', 'brakes', 'engine', 'electrical', 'fluids', 'bodywork', 'tires', 'other'];

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = () => {
    setLoading(true);
    catalogService.list({}).then((res) => setServices(res.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); reset({ name: '', category: 'general', durationMinutes: 60, price: '' }); setModalOpen(true); };
  const openEdit = (s) => { setEditing(s); reset(s); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) await catalogService.update(editing._id || editing.id, data);
      else await catalogService.create(data);
      toast({ type: 'success', title: editing ? 'Service updated' : 'Service added' });
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
      await catalogService.remove(deleteTarget._id || deleteTarget.id);
      toast({ type: 'success', title: 'Service removed' });
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast({ type: 'error', title: 'Could not remove service', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading services..." className="min-h-[50vh]" />;

  return (
    <div>
      <PageHeader title="Services" subtitle="The service catalog customers can book." action={<Button icon={Plus} onClick={openAdd}>Add Service</Button>} />

      <Card>
        <DataTable
          emptyLabel="No services yet"
          columns={[
            { key: 'name', header: 'Service' },
            { key: 'category', header: 'Category', render: (r) => <span className="capitalize">{r.category}</span> },
            { key: 'durationMinutes', header: 'Duration', render: (r) => `${r.durationMinutes} min` },
            { key: 'price', header: 'Price', render: (r) => formatCurrency(r.price) },
            {
              key: 'actions', header: '', className: 'text-right',
              render: (r) => (
                <RowActions>
                  <button onClick={() => openEdit(r)} className="rounded-lg p-1.5 text-ink-muted hover:bg-glass-1 hover:text-cyan-300"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteTarget(r)} className="rounded-lg p-1.5 text-ink-muted hover:bg-rose-400/10 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
                </RowActions>
              ),
            },
          ]}
          data={services}
        />
      </Card>

      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Service' : 'Add Service'}
        footer={<>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit(onSubmit)}>{editing ? 'Save Changes' : 'Add Service'}</Button>
        </>}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Service name" required error={errors.name?.message} {...register('name', { required: 'Required' })} />
          <Select label="Category" options={CATEGORIES.map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }))} {...register('category')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Duration (min)" type="number" {...register('durationMinutes')} />
            <Input label="Price" type="number" {...register('price')} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} loading={saving}
        title="Remove this service?" description={deleteTarget ? `"${deleteTarget.name}" will no longer be bookable.` : ''} confirmLabel="Remove"
      />
    </div>
  );
}
