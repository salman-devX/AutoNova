import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Building2, Camera } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { initials } from '../../utils/format';
import { ROLE_LABELS } from '../../utils/navConfig';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name, email: user?.email, phone: user?.phone || '' },
  });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // Email is tied to the Firebase Auth identity and isn't editable here — only name/phone are sent.
      const updated = await userService.updateMe({ name: data.name, phone: data.phone });
      updateUser(updated);
      toast({ type: 'success', title: 'Profile updated' });
    } catch (err) {
      toast({ type: 'error', title: 'Could not update profile', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profile & Settings" subtitle="Manage your personal information and preferences." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center text-center lg:col-span-1">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 text-2xl font-bold text-cyan-200">
              {initials(user?.name || 'U')}
            </div>
            <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 font-display font-semibold text-ink">{user?.name}</p>
          <p className="text-sm text-ink-muted">{ROLE_LABELS[user?.role]}</p>
          <div className="mt-4 w-full space-y-2.5 border-t border-hairline-2 pt-4 text-left text-sm">
            <div className="flex items-center gap-2 text-ink-3"><Building2 className="h-4 w-4 text-cyan-400" /> {user?.workshop || 'AutoNova Lahore'}</div>
            <div className="flex items-center gap-2 text-ink-3"><Mail className="h-4 w-4 text-cyan-400" /> {user?.email}</div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-display font-semibold text-ink">Personal Information</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" icon={User} {...register('name')} />
              <Input label="Email address" icon={Mail} type="email" disabled {...register('email')} />
            </div>
            <Input label="Phone number" icon={Phone} {...register('phone')} />
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={saving}>Save Changes</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
