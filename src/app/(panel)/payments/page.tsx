'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, ApiClientError, type PaymentRow } from '@/lib/api';
import { formatDateTime, formatMoney, formatNaira } from '@/lib/format';
import { PageLoader } from '@/components/ui/PageLoader';
import { Pagination } from '@/components/ui/Pagination';
import { SelectFilter } from '@/components/ui/Filters';
import { StatCard } from '@/components/ui/StatCard';
import { PaymentStatusBadge } from '@/components/ui/Badges';

export default function PaymentsPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading…" />}>
      <PaymentsContent />
    </Suspense>
  );
}

function PaymentsContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [plan, setPlan] = useState(params.get('plan') ?? '');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{
    payments: PaymentRow[];
    totalsByStatus: Record<string, { amount: number; count: number }>;
    total: number;
    totalPages: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    api
      .listPayments({ status: status || undefined, plan: plan || undefined, page })
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(err instanceof ApiClientError ? err.message : 'Could not load payments.'));
    return () => {
      cancelled = true;
    };
  }, [status, plan, page]);

  const totals = data?.totalsByStatus ?? {};

  return (
    <div className="space-y-stack-md">
      <div>
        <h1 className="headline-lg-mobile md:headline-lg font-bold text-primary">Payments</h1>
        <p className="body-md mt-1 text-on-surface-variant">
          Subscription checkouts. Read-only — refunds and disputes are handled in KoraPay.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon="check_circle" label="Collected" value={data ? formatNaira(totals.success?.amount ?? 0) : null} hint={`${totals.success?.count ?? 0} successful payments`} />
        <StatCard icon="schedule" label="Pending" value={data ? String(totals.pending?.count ?? 0) : null} hint={data ? `${formatNaira(totals.pending?.amount ?? 0)} awaiting confirmation` : undefined} />
        <StatCard icon="error" label="Failed" value={data ? String(totals.failed?.count ?? 0) : null} tone={(totals.failed?.count ?? 0) > 0 ? 'warning' : 'default'} hint={data ? formatNaira(totals.failed?.amount ?? 0) : undefined} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SelectFilter
          label="Status"
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={[
            { value: 'success', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
            { value: 'failed', label: 'Failed' },
          ]}
        />
        <SelectFilter
          label="Plan"
          value={plan}
          onChange={(v) => {
            setPlan(v);
            setPage(1);
          }}
          options={[
            { value: 'basic', label: 'Basic' },
            { value: 'premium', label: 'Premium' },
          ]}
        />
      </div>

      {error && <p className="body-md text-error">{error}</p>}
      {!data && !error && <PageLoader label="Loading payments…" />}

      {data &&
        (data.payments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-gray-200 p-10 text-center">
            <p className="body-md text-on-surface-variant">No payments match these filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-border-gray-200 bg-surface-container-lowest">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="label-sm border-b border-border-gray-200 text-on-surface-variant">
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-2 py-3 font-medium">Plan</th>
                    <th className="px-2 py-3 text-right font-medium">Amount</th>
                    <th className="px-2 py-3 font-medium">Status</th>
                    <th className="px-2 py-3 font-medium">Reference</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((p) => (
                    <tr key={p.id} className="border-b border-border-gray-200 last:border-0">
                      <td className="px-4 py-3">
                        {p.user ? (
                          <>
                            <Link href={`/users/${p.user.id}`} className="body-md font-semibold text-on-surface hover:underline">
                              {p.user.name}
                            </Link>
                            <p className="label-sm font-normal text-on-surface-variant">{p.user.email}</p>
                          </>
                        ) : (
                          <span className="body-md text-on-surface-variant">Deleted account</span>
                        )}
                      </td>
                      <td className="label-md px-2 py-3 capitalize text-on-surface">{p.plan}</td>
                      <td className="body-md px-2 py-3 text-right font-semibold text-on-surface">{formatMoney(p.amount, p.currency)}</td>
                      <td className="px-2 py-3">
                        <PaymentStatusBadge status={p.status} />
                      </td>
                      <td className="label-sm px-2 py-3 font-mono font-normal text-on-surface-variant">{p.reference}</td>
                      <td className="label-md px-4 py-3 font-normal text-on-surface-variant">{formatDateTime(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={data.totalPages} total={data.total} onPage={setPage} />
          </>
        ))}
    </div>
  );
}
