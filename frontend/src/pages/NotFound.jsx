import { Link } from 'react-router-dom';
import { Wrench, Home } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
        <Wrench className="h-7 w-7" />
      </div>
      <h1 className="mt-6 font-display text-5xl font-bold text-ink">404</h1>
      <p className="mt-2 text-ink-muted">This page took a wrong turn at the workshop.</p>
      <Link to="/" className="mt-8">
        <Button icon={Home}>Back to Home</Button>
      </Link>
    </div>
  );
}
