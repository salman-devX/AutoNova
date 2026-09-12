import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, MailCheck } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
  const { register, handleSubmit, getValues, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    await authService.forgotPassword(data.email);
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <MailCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">Check your inbox</h1>
        <p className="mt-2 text-sm text-ink-muted">
          We've sent a password reset link to <span className="text-ink-2">{getValues('email')}</span>.
        </p>
        <Link to="/login" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Forgot your password?</h1>
      <p className="mt-1.5 text-sm text-ink-muted">Enter your email and we'll send you a reset link.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <Input
          label="Email address" type="email" icon={Mail} placeholder="you@example.com" required
          error={errors.email?.message}
          {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })}
        />
        <Button type="submit" className="w-full" loading={loading}>Send Reset Link</Button>
      </form>

      <Link to="/login" className="mt-8 flex items-center justify-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink-2">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
    </div>
  );
}
