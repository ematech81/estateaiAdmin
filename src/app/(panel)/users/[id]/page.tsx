'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, ApiClientError, type IdentityStatus, type UserDetail } from '@/lib/api';
import { formatDate, formatMoney } from '@/lib/format';
import { PageLoader } from '@/components/ui/PageLoader';
import { StatCard } from '@/components/ui/StatCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IdentityBadge, ListingStatusBadge, PaymentStatusBadge, PlanBadge, SuspendedBadge } from '@/components/ui/Badges';

type Dialog = null | 'suspend' | 'unsuspend' | { verify: IdentityStatus };

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);

  const load = useCallback(() => {
    api
      .getUser(id)
      .then(setDetail)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : 'Could not load this user.'));
  }, [id]);

  useEffect(load, [load]);

  if (error) return <p className="body-md text-error">{error}</p>;
  if (!detail) return <PageLoader label="Loading user…" />;

  const { user, listings, payments, engagement } = detail;
  const isAdmin = user.role === 'admin';

  return (
    <div className="space-y-stack-lg">
      <div>
        <Link href="/users" className="label-md font-normal text-on-surface-variant hover:underline">
          ← All users
        </Link>
        <div className="mt-2 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="headline-lg-mobile md:headline-lg font-bold text-primary">{user.name}</h1>
              {user.suspended && <SuspendedBadge />}
            </div>
            <p className="body-md text-on-surface-variant">
              {user.email} · <span className="capitalize">{user.role}</span>
            </p>
          </div>

          {!isAdmin && (
            <div className="flex flex-wrap gap-2">
              {user.verificationStatus === 'verified' ? (
                <button type="button" className="btn-tertiary" onClick={() => setDialog({ verify: 'unverified' })}>
                  Remove verification
                </button>
              ) : (
                <button type="button" className="btn-secondary" onClick={() => setDialog({ verify: 'verified' })}>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Verify agent
                </button>
              )}
              {user.suspended ? (
                <button type="button" className="btn-primary" onClick={() => setDialog('unsuspend')}>
                  Reactivate account
                </button>
              ) : (
                <button type="button" className="btn-primary !bg-error hover:!bg-error/90" onClick={() => setDialog('suspend')}>
                  Suspend account
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {user.suspended && (
        <div className="rounded-lg border border-error/30 bg-error/5 p-4">
          <p className="label-md text-error">Suspended {formatDate(user.suspendedAt)}</p>
          <p className="body-md text-on-surface">{user.suspensionReason || 'No reason recorded.'}</p>
          <p className="label-sm mt-1 font-normal text-on-surface-variant">
            They cannot sign in, and their listings and profile are hidden from the public site.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="home_work" label="Listings" value={`${listings.filter((l) => l.status === 'active').length} live / ${listings.length}`} />
        <StatCard icon="visibility" label="Views (all time)" value={engagement.views.toLocaleString()} />
        <StatCard icon="touch_app" label="Contact clicks" value={engagement.contactClicks.toLocaleString()} />
        <StatCard icon="contact_phone" label="Details viewed" value={engagement.contactReveals.toLocaleString()} />
      </div>

      <div className="rounded-xl border border-border-gray-200 bg-surface-container-lowest p-5">
        <h2 className="headline-md mb-3 font-bold text-on-surface">Account</h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
          <Field label="Phone" value={user.phone} />
          <Field label="Business" value={user.businessName} />
          <Field label="Location" value={user.primaryLocation} />
          <Field label="Joined" value={formatDate(user.createdAt)} />
          <Field label="Email" value={user.emailVerified ? 'Verified' : 'Not verified'} />
          <div>
            <dt className="label-sm font-normal text-on-surface-variant">Identity</dt>
            <dd className="mt-1">
              <IdentityBadge status={user.verificationStatus} />
            </dd>
          </div>
          <div>
            <dt className="label-sm font-normal text-on-surface-variant">Plan</dt>
            <dd className="mt-1 flex items-center gap-2">
              <PlanBadge tier={user.planTier} />
              {user.planTier !== 'free' && (
                <span className="label-sm font-normal text-on-surface-variant">until {formatDate(user.planExpiresAt)}</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-border-gray-200 bg-surface-container-lowest p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="headline-md font-bold text-on-surface">Listings</h2>
          {listings.length > 0 && (
            <Link href={`/listings?agentId=${user.id}`} className="label-md text-trust-blue-900 underline">
              Manage in Listings
            </Link>
          )}
        </div>
        {listings.length === 0 ? (
          <p className="body-md text-on-surface-variant">No listings yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border-gray-200">
            {listings.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="body-md truncate font-semibold text-on-surface">{l.title}</p>
                  <p className="label-sm font-normal text-on-surface-variant">
                    {l.city} · <span className="capitalize">{l.listingType}</span> · {formatMoney(l.price.amount, l.price.currency)} ·{' '}
                    {formatDate(l.createdAt)}
                  </p>
                </div>
                <ListingStatusBadge status={l.status} reason={l.unavailableReason} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-border-gray-200 bg-surface-container-lowest p-5">
        <h2 className="headline-md mb-3 font-bold text-on-surface">Payments</h2>
        {payments.length === 0 ? (
          <p className="body-md text-on-surface-variant">No payments.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border-gray-200">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="body-md font-semibold capitalize text-on-surface">
                    {p.plan} · {formatMoney(p.amount, p.currency)}
                  </p>
                  <p className="label-sm font-normal text-on-surface-variant">
                    {formatDate(p.createdAt)} · {p.reference}
                  </p>
                </div>
                <PaymentStatusBadge status={p.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {dialog === 'suspend' && (
        <ConfirmDialog
          title={`Suspend ${user.name}?`}
          confirmLabel="Suspend account"
          danger
          askReason
          reasonLabel="Reason (kept in the activity log)"
          onCancel={() => setDialog(null)}
          onConfirm={async (reason) => {
            await run(() => api.setSuspension(user.id, true, reason));
          }}
        >
          They will be signed out immediately and can’t sign in again, and all of their listings and their agent
          profile disappear from the public site. Nothing is deleted — you can reactivate them at any time.
        </ConfirmDialog>
      )}
      {dialog === 'unsuspend' && (
        <ConfirmDialog
          title={`Reactivate ${user.name}?`}
          confirmLabel="Reactivate"
          onCancel={() => setDialog(null)}
          onConfirm={async () => {
            await run(() => api.setSuspension(user.id, false));
          }}
        >
          They’ll be able to sign in again, and their listings and profile will reappear on the public site.
        </ConfirmDialog>
      )}
      {dialog && typeof dialog === 'object' && (
        <ConfirmDialog
          title={dialog.verify === 'verified' ? `Verify ${user.name}?` : `Remove ${user.name}’s verification?`}
          confirmLabel={dialog.verify === 'verified' ? 'Verify agent' : 'Remove verification'}
          onCancel={() => setDialog(null)}
          onConfirm={async () => {
            await run(() => api.setVerification(user.id, dialog.verify));
          }}
        >
          {dialog.verify === 'verified'
            ? 'This is an identity check you’ve done yourself. Their listings will show the “Verified Listing” badge to the public. Only verify someone you’re confident is who they say they are.'
            : 'The “Verified Listing” badge will be removed from all of their listings.'}
        </ConfirmDialog>
      )}
    </div>
  );

  async function run(action: () => Promise<unknown>) {
    await action();
    setDialog(null);
    load();
  }
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="label-sm font-normal text-on-surface-variant">{label}</dt>
      <dd className="body-md text-on-surface">{value || '—'}</dd>
    </div>
  );
}
