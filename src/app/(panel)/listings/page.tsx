'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, ApiClientError, type AdminListing } from '@/lib/api';
import { formatDate, formatMoney } from '@/lib/format';
import { PageLoader } from '@/components/ui/PageLoader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchBox, SelectFilter } from '@/components/ui/Filters';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ListingStatusBadge } from '@/components/ui/Badges';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function ListingsPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading…" />}>
      <ListingsContent />
    </Suspense>
  );
}

function ListingsContent() {
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [listingType, setListingType] = useState(params.get('listingType') ?? '');
  const [removed, setRemoved] = useState(params.get('removed') ?? '');
  const agentId = params.get('agentId') ?? undefined;
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ listings: AdminListing[]; total: number; totalPages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<{ listing: AdminListing; action: 'remove' | 'restore' } | null>(null);

  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  const load = useCallback(() => {
    setError(null);
    return api
      .listListings({
        search: search || undefined,
        status: status || undefined,
        listingType: listingType || undefined,
        removed: removed ? removed === 'true' : undefined,
        agentId,
        page,
      })
      .then(setData)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : 'Could not load listings.'));
  }, [search, status, listingType, removed, agentId, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-stack-md">
      <div>
        <h1 className="headline-lg-mobile md:headline-lg font-bold text-primary">Listings</h1>
        <p className="body-md mt-1 text-on-surface-variant">
          Every listing on the platform. Remove anything misleading or fraudulent — the agent keeps the record but can’t
          put it back.
        </p>
        {agentId && (
          <p className="label-md mt-2 font-normal text-on-surface-variant">
            Showing one agent’s listings.{' '}
            <Link href="/listings" className="underline">
              Show all
            </Link>
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBox value={search} onChange={reset(setSearch)} placeholder="Search title, city or district" />
        <SelectFilter
          label="Status"
          value={status}
          onChange={reset(setStatus)}
          options={[
            { value: 'active', label: 'Live' },
            { value: 'inactive', label: 'Unavailable' },
            { value: 'pending_review', label: 'Pending review' },
            { value: 'draft', label: 'Draft' },
          ]}
        />
        <SelectFilter
          label="Type"
          value={listingType}
          onChange={reset(setListingType)}
          options={[
            { value: 'sale', label: 'For sale' },
            { value: 'rent', label: 'For rent' },
            { value: 'shortlet', label: 'Shortlet' },
          ]}
        />
        <SelectFilter
          label="Moderation"
          value={removed}
          onChange={reset(setRemoved)}
          options={[
            { value: 'true', label: 'Removed by admin' },
            { value: 'false', label: 'Not removed' },
          ]}
        />
      </div>

      {error && <p className="body-md text-error">{error}</p>}
      {!data && !error && <PageLoader label="Loading listings…" />}

      {data && (
        <>
          {data.listings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-gray-200 p-10 text-center">
              <p className="body-md text-on-surface-variant">No listings match these filters.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {data.listings.map((l) => (
                <li
                  key={l.id}
                  className="flex flex-col gap-3 rounded-xl border border-border-gray-200 bg-surface-container-lowest p-4 md:flex-row md:items-center"
                >
                  <div className="h-20 w-full shrink-0 overflow-hidden rounded-lg bg-surface-gray-50 md:w-32">
                    {l.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- agent-uploaded photos, not from a configured next/image domain
                      <img src={l.photo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="material-symbols-outlined text-[32px] text-surface-tint">image_not_supported</span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <ListingStatusBadge status={l.status} reason={l.unavailableReason} />
                      <p className="body-md truncate font-semibold text-on-surface">{l.title}</p>
                    </div>
                    <p className="label-sm mt-1 font-normal text-on-surface-variant">
                      {l.city}
                      {l.state ? `, ${l.state}` : ''} · <span className="capitalize">{l.listingType}</span> ·{' '}
                      {formatMoney(l.price.amount, l.price.currency)} · {formatDate(l.createdAt)} · {l.views.toLocaleString()} views
                    </p>
                    {l.agent && (
                      <p className="label-sm mt-1 font-normal text-on-surface-variant">
                        By{' '}
                        <Link href={`/users/${l.agent.id}`} className="underline">
                          {l.agent.name}
                        </Link>{' '}
                        ({l.agent.email}){l.agent.suspended ? ' · account suspended' : ''}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {(l.status === 'active' || l.status === 'pending_review') && (
                      <a href={`${SITE_URL}/properties/${l.id}`} target="_blank" rel="noreferrer" className="btn-tertiary">
                        View
                      </a>
                    )}
                    {l.unavailableReason === 'removed' ? (
                      <button type="button" className="btn-secondary" onClick={() => setTarget({ listing: l, action: 'restore' })}>
                        Restore
                      </button>
                    ) : (
                      l.status !== 'draft' && (
                        <button
                          type="button"
                          className="btn-tertiary !border-error !text-error hover:!bg-error/10"
                          onClick={() => setTarget({ listing: l, action: 'remove' })}
                        >
                          Remove
                        </button>
                      )
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Pagination page={page} totalPages={data.totalPages} total={data.total} onPage={setPage} />
        </>
      )}

      {target && (
        <ConfirmDialog
          title={target.action === 'remove' ? 'Remove this listing?' : 'Restore this listing?'}
          confirmLabel={target.action === 'remove' ? 'Remove listing' : 'Restore listing'}
          danger={target.action === 'remove'}
          askReason={target.action === 'remove'}
          reasonLabel="Reason (kept in the activity log)"
          onCancel={() => setTarget(null)}
          onConfirm={async (reason) => {
            await api.moderateListing(target.listing.id, target.action, reason);
            setTarget(null);
            await load();
          }}
        >
          <strong className="text-on-surface">{target.listing.title}</strong>
          <br />
          {target.action === 'remove'
            ? 'It will disappear from the public site immediately. The agent still sees it in their dashboard, marked “Removed”, but cannot put it back themselves.'
            : 'It will go live again on the public site.'}
        </ConfirmDialog>
      )}
    </div>
  );
}
