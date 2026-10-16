'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, ApiClientError, type ActivityRow } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { PageLoader } from '@/components/ui/PageLoader';
import { Pagination } from '@/components/ui/Pagination';

const ACTION_META: Record<string, { label: string; icon: string; danger?: boolean }> = {
  'user.suspend': { label: 'Suspended account', icon: 'block', danger: true },
  'user.unsuspend': { label: 'Reactivated account', icon: 'check_circle' },
  'user.verify': { label: 'Verified agent', icon: 'verified' },
  'user.unverify': { label: 'Removed verification', icon: 'remove_moderator', danger: true },
  'listing.remove': { label: 'Removed listing', icon: 'delete', danger: true },
  'listing.restore': { label: 'Restored listing', icon: 'restore' },
  'blog.create': { label: 'Created blog post', icon: 'edit_note' },
  'blog.update': { label: 'Edited blog post', icon: 'edit_note' },
  'blog.delete': { label: 'Deleted blog post', icon: 'delete', danger: true },
};

function targetHref(a: ActivityRow): string | null {
  if (a.targetType === 'user') return `/users/${a.targetId}`;
  if (a.targetType === 'blog' && a.type !== 'blog.delete') return `/blog/${a.targetId}`;
  return null;
}

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ actions: ActivityRow[]; total: number; totalPages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listActivity(page)
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(err instanceof ApiClientError ? err.message : 'Could not load the activity log.'));
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="space-y-stack-md">
      <div>
        <h1 className="headline-lg-mobile md:headline-lg font-bold text-primary">Activity log</h1>
        <p className="body-md mt-1 text-on-surface-variant">
          A permanent record of every change an administrator makes: who did what, to what, and when.
        </p>
      </div>

      {error && <p className="body-md text-error">{error}</p>}
      {!data && !error && <PageLoader label="Loading activity…" />}

      {data &&
        (data.actions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-gray-200 p-10 text-center">
            <p className="body-md text-on-surface-variant">No admin actions yet.</p>
          </div>
        ) : (
          <>
            <ul className="flex flex-col divide-y divide-border-gray-200 rounded-xl border border-border-gray-200 bg-surface-container-lowest">
              {data.actions.map((a) => {
                const meta = ACTION_META[a.type] ?? { label: a.type, icon: 'history' };
                const href = targetHref(a);
                return (
                  <li key={a.id} className="flex items-start gap-3 p-4">
                    <span className={`material-symbols-outlined mt-0.5 ${meta.danger ? 'text-error' : 'text-on-surface-variant'}`}>
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="body-md text-on-surface">
                        <span className="font-semibold">{meta.label}</span>{' '}
                        {href ? (
                          <Link href={href} className="underline">
                            {a.targetLabel}
                          </Link>
                        ) : (
                          a.targetLabel
                        )}
                      </p>
                      {a.note && <p className="label-md font-normal text-on-surface-variant">“{a.note}”</p>}
                      <p className="label-sm font-normal text-on-surface-variant">
                        {a.admin ? `${a.admin.name} (${a.admin.email})` : 'Unknown admin'} · {formatDateTime(a.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Pagination page={page} totalPages={data.totalPages} total={data.total} onPage={setPage} />
          </>
        ))}
    </div>
  );
}
