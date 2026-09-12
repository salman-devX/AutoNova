import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { mockDelay } from '../../services/apiClient';

export default function VerifyEmail() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const resend = async () => {
    setLoading(true);
    await mockDelay(800);
    setLoading(false);
    toast({ type: 'success', title: 'Verification email sent' });
  };

  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
        <MailCheck className="h-6 w-6" />
      </div>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink">Verify your email</h1>
      <p className="mt-2 text-sm text-ink-muted">
        We've sent a verification link to your inbox. Please verify your email to activate your account.
      </p>
      <Button variant="secondary" className="mt-8 w-full" icon={RefreshCw} loading={loading} onClick={resend}>
        Resend Verification Email
      </Button>
      <Link to="/login" className="mt-6 block text-sm font-medium text-cyan-400 hover:text-cyan-300">Back to sign in</Link>
    </div>
  );
}
