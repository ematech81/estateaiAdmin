'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClientError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { LoadingButton } from '@/components/ui/LoadingButton';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isLoading, user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) router.replace('/');
  }, [isLoading, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-gutter py-stack-lg">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-stack-md rounded-xl border border-border-gray-200 bg-surface-container-lowest p-stack-lg shadow-sm"
      >
        <div className="text-center">
          <h1 className="headline-lg-mobile text-trust-blue-900">EstateAI Admin</h1>
          <p className="body-md mt-1 text-on-surface-variant">Sign in with your administrator account.</p>
        </div>

        <label className="label-md flex flex-col gap-1 text-on-surface-variant">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            autoFocus
            className="input-standard"
          />
        </label>
        <label className="label-md flex flex-col gap-1 text-on-surface-variant">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="input-standard"
          />
        </label>

        {error && <p className="body-md text-error">{error}</p>}

        <LoadingButton type="submit" loading={submitting} loadingText="Signing in…">
          Sign in
        </LoadingButton>
      </form>
    </main>
  );
}
