import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, UserCog } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, RowActions } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { Loader } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { staffService } from '../../services/staffService';
import { formatDate } from '../../utils/format';

export default function Receptionists() {
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = () => {
    setLoading(true);
    staffService.listReceptionists({}).then((res) => setReceptionists(res.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { reset({ name: '', email: '', phone: '' }); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const { user, tempPassword } = await staffService.createReceptionist(data);
      setModalOpen(false);
      setCreatedCredentials({ name: user.name, email: user.email, tempPassword });
      load();
    } catch (err) {
      toast({ type: 'error', title: 'Could not add receptionist', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const confirmDeactivate = async () => {
    setSaving(true);
    try {
      await staffService.deactivate(deactivateTarget._id || deactivateTarget.id);
      toast({ type: 'success', title: 'Receptionist deactivated' });
      setDeactivateTarget(null);
      load();
    } catch (err) {
      toast({ type: 'error', title: 'Could not deactivate', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading receptionists..." className="min-h-[50vh]" />;

  return (
    <div>
      <PageHeader title="Receptionists" subtitle="Front-desk staff accounts." action={<Button icon={Plus} onClick={openAdd}>Add Receptionist</Button>} />

      <Card>
        <DataTable
          emptyLabel="No receptionists yet"
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
            { key: 'phone', header: 'Phone' },
            { key: 'createdAt', header: 'Joined', render: (r) => formatDate(r.createdAt) },
            { key: 'isActive', header: 'Status', render: (r) => <StatusBadge status={r.isActive ? 'Active' : 'Inactive'} /> },
            {
              key: 'actions', header: '', className: 'text-right',
              render: (r) => (
                <RowActions>
                  {r.isActive && (
                    <Button size="sm" variant="secondary" onClick={() => setDeactivateTarget(r)}>Deactivate</Button>
                  )}
                </RowActions>
              ),
            },
          ]}
          data={receptionists}
        />
      </Card>

      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)} title="Add Receptionist"
        footer={<>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit(onSubmit)}>Add Receptionist</Button>
        </>}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full name" required error={errors.name?.message} {...register('name', { required: 'Required' })} />
          <Input label="Email" type="email" required error={errors.email?.message} {...register('email', { required: 'Required' })} />
          <Input label="Phone" {...register('phone')} />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deactivateTarget} onClose={() => setDeactivateTarget(null)} onConfirm={confirmDeactivate} loading={saving}
        title="Deactivate this account?" description={deactivateTarget ? `${deactivateTarget.name} will lose access to AutoHubX.` : ''} confirmLabel="Deactivate"
      />

      <Modal
        open={!!createdCredentials} onClose={() => setCreatedCredentials(null)} title="Receptionist account created"
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
