'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, ApiClientError, type Overview } from '@/lib/api';
import { formatCompact, formatNaira, percent } from '@/lib/format';
import { PageLoader } from '@/components/ui/PageLoader';
import { StatCard } from '@/components/ui/StatCard';
import { DailyChart } from '@/components/ui/DailyChart';

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

export default function OverviewPage() {
  const [days, setDays] = useState<Range>(30);
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    api
      .getOverview(days)
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(err instanceof ApiClientError ? err.message : 'Could not load the overview.'));
    return () => {
      cancelled = true;
    };
  }, [days]);

  return (
    <div className="space-y-stack-lg">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="headline-lg-mobile md:headline-lg font-bold text-primary">Overview</h1>
          <p className="body-md mt-1 text-on-surface-variant">How the platform is doing. Every number is counted, not estimated.</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border-gray-200 bg-surface-container-lowest p-1" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDays(r)}
              aria-pressed={days === r}
              className={`label-md rounded px-3 py-1 transition-colors ${
                days === r ? 'bg-trust-blue-900 text-white' : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {r} days
            </button>
          ))}
        </div>
      </div>

      {error && <p className="body-md text-error">{error}</p>}
      {!data && !error && <PageLoader label="Loading overview…" />}

      {data && <OverviewBody data={data} />}
    </div>
  );
}

function OverviewBody({ data }: { data: Overview }) {
  const { users, listings, subscriptions, revenue, engagement, daily } = data;
  const activeListings = listings.byStatus.active ?? 0;
  const paid = subscriptions.activeBasic + subscriptions.activePremium;

  const attention = [
    { label: 'Failed payments', count: revenue.failedInRange, href: '/payments?status=failed', hint: `last ${data.days} days` },
    { label: 'Pending payments', count: revenue.pending, href: '/payments?status=pending', hint: 'awaiting confirmation' },
    { label: 'Suspended accounts', count: users.suspended, href: '/users?suspended=true', hint: 'currently blocked' },
    { label: 'Listings removed by admin', count: listings.removedByAdmin, href: '/listings?removed=true', hint: 'hidden from the public' },
  ].filter((a) => a.count > 0);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="group" label="Users" value={users.total.toLocaleString()} hint={`+${users.newInRange} in the last ${data.days} days`} />
        <StatCard
          icon="home_work"
          label="Live listings"
          value={activeListings.toLocaleString()}
          hint={`${listings.total.toLocaleString()} total · +${listings.newInRange} new`}
        />
        <StatCard
          icon="workspace_premium"
          label="Paid subscribers"
          value={paid.toLocaleString()}
          hint={`${subscriptions.activeBasic} Basic · ${subscriptions.activePremium} Premium`}
        />
        <StatCard
          icon="payments"
          label={`Revenue (${data.days} days)`}
          value={formatNaira(revenue.inRange)}
          hint={`${formatNaira(revenue.allTime)} all time · ${revenue.allTimePayments} payments`}
        />
        <StatCard
          icon="visibility"
          label="Property views"
          value={formatCompact(engagement.views)}
          hint={`${formatCompact(engagement.uniqueVisitors)} unique visitors`}
        />
        <StatCard icon="touch_app" label="Contact clicks" value={formatCompact(engagement.contactClicks)} />
        <StatCard
          icon="contact_phone"
          label="Agent details viewed"
          value={formatCompact(engagement.contactReveals)}
          hint={`${percent(engagement.contactReveals, engagement.views)} of views`}
        />
        <StatCard
          icon="mark_email_read"
          label="Emails verified"
          value={percent(users.emailVerified, users.total)}
          hint={`${users.identityVerified} identity-verified agents`}
        />
      </div>

      <div className="rounded-xl border border-border-gray-200 bg-surface-container-lowest p-5">
        <h2 className="headline-md mb-3 font-bold text-on-surface">Needs attention</h2>
        {attention.length === 0 ? (
          <p className="body-md text-on-surface-variant">All clear — nothing needs your attention right now.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {attention.map((a) => (
              <li key={a.label}>
                <Link
                  href={a.href}
                  className="flex h-full flex-col rounded-lg border border-error/30 bg-error/5 p-4 transition-colors hover:bg-error/10"
                >
                  <span className="headline-md font-bold text-error">{a.count}</span>
                  <span className="label-md text-on-surface">{a.label}</span>
                  <span className="label-sm font-normal text-on-surface-variant">{a.hint}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="New sign-ups"><DailyChart data={daily.signups} unit="sign-up" /></ChartCard>
        <ChartCard title="New listings"><DailyChart data={daily.listings} unit="listing" /></ChartCard>
        <ChartCard title="Property views"><DailyChart data={daily.views} unit="view" /></ChartCard>
        <ChartCard title="Revenue"><DailyChart data={daily.revenue} unit="payment" format={formatNaira} color="#10B981" /></ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border-gray-200 bg-surface-container-lowest p-5">
          <h2 className="headline-md mb-3 font-bold text-on-surface">Most viewed listings</h2>
          {data.topListings.length === 0 ? (
            <p className="body-md text-on-surface-variant">No views in this period yet.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {data.topListings.map((l, i) => (
                <li key={l.id} className="flex items-center gap-3">
                  <span className="label-md w-5 text-on-surface-variant">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="body-md truncate font-semibold text-on-surface">{l.title}</p>
                    <p className="label-sm truncate font-normal text-on-surface-variant">
                      {[l.city, l.agent].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="label-md font-bold text-on-surface">{l.views.toLocaleString()}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-xl border border-border-gray-200 bg-surface-container-lowest p-5">
          <h2 className="headline-md mb-3 font-bold text-on-surface">Platform makeup</h2>
          <Breakdown title="Users by role" counts={users.byRole} hide={['admin']} />
          <Breakdown title="Listings by status" counts={listings.byStatus} labels={{ pending_review: 'pending review', inactive: 'unavailable' }} />
          <Breakdown title="Live listings by type" counts={listings.activeByType} />
          <div className="mt-4">
            <p className="label-md mb-2 text-on-surface-variant">Top cities (live listings)</p>
            {listings.topCities.length === 0 ? (
              <p className="body-md text-on-surface-variant">No live listings yet.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {listings.topCities.map((c) => (
                  <li key={c.city} className="badge-international">
                    {c.city} · {c.count}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border-gray-200 bg-surface-container-lowest p-5">
      <h2 className="headline-md mb-3 font-bold text-on-surface">{title}</h2>
      {children}
    </div>
  );
}

function Breakdown({
  title,
  counts,
  hide = [],
  labels = {},
}: {
  title: string;
  counts: Record<string, number>;
  hide?: string[];
  labels?: Record<string, string>;
}) {
  const entries = Object.entries(counts).filter(([k, n]) => !hide.includes(k) && n > 0);
  const total = entries.reduce((s, [, n]) => s + n, 0);
  if (entries.length === 0) return null;
  return (
    <div className="mb-4">
      <p className="label-md mb-2 text-on-surface-variant">{title}</p>
      <ul className="flex flex-col gap-1.5">
        {entries.map(([key, n]) => (
          <li key={key} className="flex items-center gap-3">
            <span className="label-md flex-1 capitalize text-on-surface">{labels[key] ?? key}</span>
            <span className="label-sm font-normal text-on-surface-variant">{percent(n, total)}</span>
            <span className="label-md w-10 text-right font-bold text-on-surface">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
