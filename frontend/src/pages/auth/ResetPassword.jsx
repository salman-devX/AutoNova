import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, CheckCircle2 } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

export default function ResetPassword() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    await authService.resetPassword('mock-token', data.password);
    setLoading(false);
    toast({ type: 'success', title: 'Password updated', message: 'You can now sign in with your new password.' });
    navigate('/login');
  };

  return (
    <div>
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h1 className="font-display text-2xl font-bold text-ink">Set a new password</h1>
      <p className="mt-1.5 text-sm text-ink-muted">Choose a strong password you haven't used before.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <Input
          label="New password" type="password" icon={Lock} required
          error={errors.password?.message}
          {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
        />
        <Input
          label="Confirm new password" type="password" icon={Lock} required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', { required: 'Please confirm your password', validate: (v) => v === password || 'Passwords do not match' })}
        />
        <Button type="submit" className="w-full" loading={loading}>Update Password</Button>
      </form>
    </div>
  );
}
