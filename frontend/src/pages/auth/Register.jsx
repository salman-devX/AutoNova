import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Phone, UserPlus } from 'lucide-react';
import Input from '../../components/common/Input';
import { Checkbox } from '../../components/common/FormFields';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register: signUp, registerWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const account = await signUp(data);
      toast({ type: 'success', title: 'Account created', message: 'Welcome to AutoNova!' });
      navigate(`/${account.role}/dashboard`, { replace: true });
    } catch (err) {
      toast({ type: 'error', title: 'Registration failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const onGoogleClick = async () => {
    setGoogleLoading(true);
    try {
      const account = await registerWithGoogle();
      toast({ type: 'success', title: 'Account created', message: 'Welcome to AutoNova!' });
      navigate(`/${account.role}/dashboard`, { replace: true });
    } catch (err) {
      toast({ type: 'error', title: 'Google sign-up failed', message: err.message });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Create your account</h1>
      <p className="mt-1.5 text-sm text-ink-muted">Book appointments and track your vehicle's service journey.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <Input
          label="Full name" icon={User} placeholder="Ahmed Raza" required
          error={errors.name?.message}
          {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name is too short' } })}
        />
        <Input
          label="Email address" type="email" icon={Mail} placeholder="you@example.com" required
          error={errors.email?.message}
          {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })}
        />
        <Input
          label="Phone number" type="tel" icon={Phone} placeholder="+92 300 1234567"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Password" type="password" icon={Lock} placeholder="Create a password" required
          hint="At least 8 characters, with a number"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'At least 8 characters' },
            pattern: { value: /\d/, message: 'Must include at least one number' },
          })}
        />
        <Input
          label="Confirm password" type="password" icon={Lock} placeholder="Re-enter password" required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (v) => v === password || 'Passwords do not match',
          })}
        />
        <Checkbox
          label={<span>I agree to the <a href="#" className="text-cyan-400 hover:underline">Terms of Service</a> and <a href="#" className="text-cyan-400 hover:underline">Privacy Policy</a></span>}
          {...register('terms', { required: true })}
        />
        {errors.terms && <p className="text-xs text-rose-400">You must accept the terms to continue.</p>}

        <Button type="submit" className="w-full" icon={UserPlus} loading={loading}>Create Account</Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-wide text-ink-muted">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <Button
        type="button" variant="secondary" className="w-full" loading={googleLoading}
        onClick={onGoogleClick}
      >
        <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4c-7.5 0-14 4.2-17.7 10.7z" />
          <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.7 34.9 27 36 24 36c-5.2 0-9.7-3.3-11.3-8l-6.6 5.1C9.9 39.7 16.4 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C41.4 36 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z" />
        </svg>
        Continue with Google
      </Button>

      <p className="mt-8 text-center text-sm text-ink-muted">
        Already have an account? <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300">Sign in</Link>
      </p>
    </div>
  );
}
