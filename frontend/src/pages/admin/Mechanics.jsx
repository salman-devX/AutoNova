import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, RowActions } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { staffService } from '../../services/staffService';

export default function Mechanics() {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = () => {
    setLoading(true);
    staffService.listMechanics({}).then((res) => setMechanics(res.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { reset({ name: '', email: '', phone: '' }); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const { user, tempPassword } = await staffService.createMechanic(data);
      setModalOpen(false);
      // Show the one-time temporary password so the admin can hand it to the new mechanic.
      setCreatedCredentials({ name: user.name, email: user.email, tempPassword });
      load();
    } catch (err) {
      toast({ type: 'error', title: 'Could not add mechanic', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (m) => {
    await staffService.updateMechanic(m._id || m.id, { isAvailable: !m.isAvailable });
    load();
  };

  if (loading) return <Loader label="Loading mechanics..." className="min-h-[50vh]" />;

  return (
    <div>
      <PageHeader title="Mechanics" subtitle="Workshop roster and specializations." action={<Button icon={Plus} onClick={openAdd}>Add Mechanic</Button>} />

      <Card>
        <DataTable
          emptyLabel="No mechanics yet"
          columns={[
            { key: 'name', header: 'Name', render: (r) => r.userId?.name },
            { key: 'email', header: 'Email', render: (r) => r.userId?.email },
            {
              key: 'specializations', header: 'Specializations',
              render: (r) => (
                <span className="flex flex-wrap gap-1">
                  {r.specializations?.length ? r.specializations.map((s) => <span key={s} className="badge bg-glass-1 text-ink-2 border-hairline-2">{s}</span>) : '—'}
                </span>
              ),
            },
            { key: 'isAvailable', header: 'Availability', render: (r) => <StatusBadge status={r.isAvailable ? 'Active' : 'Low Stock'} /> },
            {
              key: 'actions', header: '', className: 'text-right',
              render: (r) => (
                <RowActions>
                  <Button size="sm" variant="secondary" onClick={() => toggleAvailability(r)}>
                    {r.isAvailable ? 'Set Unavailable' : 'Set Available'}
                  </Button>
                </RowActions>
              ),
            },
          ]}
          data={mechanics}
        />
      </Card>

      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)} title="Add Mechanic"
        footer={<>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit(onSubmit)}>Add Mechanic</Button>
        </>}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full name" required error={errors.name?.message} {...register('name', { required: 'Required' })} />
          <Input label="Email" type="email" required error={errors.email?.message} {...register('email', { required: 'Required' })} />
          <Input label="Phone" {...register('phone')} />
          <p className="text-xs text-ink-muted">A temporary password will be generated — you'll need to share it with them directly.</p>
        </form>
      </Modal>

      <Modal
        open={!!createdCredentials} onClose={() => setCreatedCredentials(null)} title="Mechanic account created"
        footer={<Button onClick={() => setCreatedCredentials(null)}>Done</Button>}
      >
        {createdCredentials && (
          <div className="space-y-3 text-sm">
            <p className="text-ink-2">Share these sign-in details with <strong>{createdCredentials.name}</strong> — this password won't be shown again.</p>
            <div className="space-y-1 rounded-xl border border-hairline-2 bg-glass-1 p-3 font-mono text-sm">
              <p>Email: {createdCredentials.email}</p>
              <p>Temporary password: {createdCredentials.tempPassword}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
