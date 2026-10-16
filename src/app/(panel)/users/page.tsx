'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, ApiClientError, type AdminUserRow } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { PageLoader } from '@/components/ui/PageLoader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchBox, SelectFilter } from '@/components/ui/Filters';
import { IdentityBadge, PlanBadge, SuspendedBadge } from '@/components/ui/Badges';

// useSearchParams() needs a Suspense boundary. Filters can arrive in the URL
// (e.g. the Overview's "Suspended accounts" link) and seed the initial state.
export default function UsersPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading…" />}>
      <UsersContent />
    </Suspense>
  );
}

function UsersContent() {
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [role, setRole] = useState(params.get('role') ?? '');
  const [plan, setPlan] = useState(params.get('plan') ?? '');
  const [emailVerified, setEmailVerified] = useState(params.get('emailVerified') ?? '');
  const [suspended, setSuspended] = useState(params.get('suspended') ?? '');
  const [verification, setVerification] = useState(params.get('verification') ?? '');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ users: AdminUserRow[]; total: number; totalPages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Any filter change goes back to page 1.
  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  useEffect(() => {
    let cancelled = false;
    setError(null);
    api
      .listUsers({
        search: search || undefined,
        role: role || undefined,
        plan: plan || undefined,
        emailVerified: emailVerified ? emailVerified === 'true' : undefined,
        suspended: suspended ? suspended === 'true' : undefined,
        verification: verification || undefined,
        page,
      })
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(err instanceof ApiClientError ? err.message : 'Could not load users.'));
    return () => {
      cancelled = true;
    };
  }, [search, role, plan, emailVerified, suspended, verification, page]);

  return (
    <div className="space-y-stack-md">
      <div>
        <h1 className="headline-lg-mobile md:headline-lg font-bold text-primary">Users</h1>
        <p className="body-md mt-1 text-on-surface-variant">Agents, agencies, owners and admins.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBox value={search} onChange={reset(setSearch)} placeholder="Search name, email, business, phone" />
        <SelectFilter
          label="Role"
          value={role}
          onChange={reset(setRole)}
          options={[
            { value: 'agent', label: 'Agent' },
            { value: 'agency', label: 'Agency' },
            { value: 'owner', label: 'Owner' },
            { value: 'admin', label: 'Admin' },
          ]}
        />
        <SelectFilter
          label="Plan"
          value={plan}
          onChange={reset(setPlan)}
          options={[
            { value: 'free', label: 'Free' },
            { value: 'basic', label: 'Basic' },
            { value: 'premium', label: 'Premium' },
          ]}
        />
        <SelectFilter
          label="Email"
          value={emailVerified}
          onChange={reset(setEmailVerified)}
          options={[
            { value: 'true', label: 'Verified' },
            { value: 'false', label: 'Not verified' },
          ]}
        />
        <SelectFilter
          label="Identity"
          value={verification}
          onChange={reset(setVerification)}
          options={[
            { value: 'verified', label: 'Verified' },
            { value: 'pending', label: 'Pending' },
            { value: 'unverified', label: 'Unverified' },
          ]}
        />
        <SelectFilter
          label="Status"
          value={suspended}
          onChange={reset(setSuspended)}
          options={[
            { value: 'true', label: 'Suspended' },
            { value: 'false', label: 'Active' },
          ]}
        />
      </div>

      {error && <p className="body-md text-error">{error}</p>}
      {!data && !error && <PageLoader label="Loading users…" />}

      {data && (
        <>
          {data.users.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-gray-200 p-10 text-center">
              <p className="body-md text-on-surface-variant">No users match these filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border-gray-200 bg-surface-container-lowest">
              <table className="w-full min-w-[820px] text-left">
                <thead>
                  <tr className="label-sm border-b border-border-gray-200 text-on-surface-variant">
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-2 py-3 font-medium">Role</th>
                    <th className="px-2 py-3 font-medium">Plan</th>
                    <th className="px-2 py-3 font-medium">Email</th>
                    <th className="px-2 py-3 font-medium">Identity</th>
                    <th className="px-2 py-3 text-right font-medium">Listings</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((u) => (
                    <tr key={u.id} className="border-b border-border-gray-200 last:border-0 hover:bg-surface-container-low">
                      <td className="px-4 py-3">
                        <Link href={`/users/${u.id}`} className="body-md font-semibold text-on-surface hover:underline">
                          {u.name}
                        </Link>
                        {u.suspended && (
                          <span className="ml-2">
                            <SuspendedBadge />
                          </span>
                        )}
                        <p className="label-sm font-normal text-on-surface-variant">{u.email}</p>
                      </td>
                      <td className="label-md px-2 py-3 capitalize text-on-surface">{u.role}</td>
                      <td className="px-2 py-3">
                        <PlanBadge tier={u.planTier} />
                      </td>
                      <td className="px-2 py-3">
                        {u.emailVerified ? (
                          <span className="material-symbols-outlined text-[20px] text-growth-emerald-500" title="Email verified">
                            check_circle
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-[20px] text-on-surface-variant/50" title="Not verified">
                            cancel
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <IdentityBadge status={u.verificationStatus} />
                      </td>
                      <td className="body-md px-2 py-3 text-right text-on-surface">
                        {u.activeListingCount}
                        <span className="label-sm font-normal text-on-surface-variant"> / {u.listingCount}</span>
                      </td>
                      <td className="label-md px-4 py-3 font-normal text-on-surface-variant">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={page} totalPages={data.totalPages} total={data.total} onPage={setPage} />
        </>
      )}
    </div>
  );
}
