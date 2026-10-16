"use client";

import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from './auth-provider';
import { useAuthUI } from './auth-ui';

export function AccountGate({ children, purpose = 'create invitations' }: {
  children: React.ReactNode;
  purpose?: string;
}) {
  const { enabled, loading, email, isAnonymous, emailConfirmed, userId } = useAuth();
  const { openAuth } = useAuthUI();
  const [linkProblem, setLinkProblem] = useState(false);
  useEffect(() => {
    setLinkProblem(new URLSearchParams(window.location.search).get('auth') === 'link');
  }, []);
  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 aria-label="Checking account" className="size-6 animate-spin text-gold" /></div>;
  if (enabled && email && !isAnonymous && emailConfirmed) return <Fragment key={userId}>{children}</Fragment>;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-title font-light">{enabled ? `Sign in to ${purpose}` : 'Online saving is unavailable'}</h1>
      <p className="mt-5 text-sm leading-relaxed text-charcoal-400">
        {enabled
          ? 'Use your email account to save invitations, photos and replies online and access them from any device. Confirm your email before continuing.'
          : 'This site needs its online storage connected before invitations can be saved or published. Please try again once setup is complete.'}
      </p>
      {enabled && linkProblem ? <p role="status" className="mt-4 text-sm text-charcoal-400">That email link has expired or was already used. If you confirmed your email, sign in with your email and password.</p> : null}
      {enabled ? <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={() => openAuth('signin', { redirectPath: window.location.pathname + window.location.search })}>Sign in</Button>
        <Button variant="outline" onClick={() => openAuth('claim', { redirectPath: window.location.pathname + window.location.search })}>Create an account</Button>
      </div> : null}
      <Link className="mt-7 text-sm underline underline-offset-4" href="/templates">Browse designs</Link>
    </main>
  );
}
