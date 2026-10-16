import type { IdentityStatus, ListingStatus, PlanTier, UnavailableReason } from '@/lib/api';

export function PlanBadge({ tier }: { tier: PlanTier }) {
  const cls = tier === 'premium' ? 'badge-verified' : tier === 'basic' ? 'badge-action' : 'badge-pending';
  return <span className={`${cls} capitalize`}>{tier}</span>;
}

export function IdentityBadge({ status }: { status: IdentityStatus }) {
  if (status === 'verified') {
    return (
      <span className="badge-verified">
        <span className="material-symbols-outlined text-[14px]">verified</span>
        Verified
      </span>
    );
  }
  return <span className="badge-pending capitalize">{status}</span>;
}

export function ListingStatusBadge({ status, reason }: { status: ListingStatus; reason?: UnavailableReason }) {
  if (status === 'inactive') {
    const label = reason === 'removed' ? 'Removed' : reason === 'sold' ? 'Sold' : reason === 'rented' ? 'Rented' : 'Unavailable';
    return <span className="badge bg-error/10 text-error">{label}</span>;
  }
  if (status === 'active') return <span className="badge-verified">Live</span>;
  return <span className="badge-pending capitalize">{status.replace('_', ' ')}</span>;
}

export function PaymentStatusBadge({ status }: { status: 'pending' | 'success' | 'failed' }) {
  if (status === 'success') return <span className="badge-verified">Paid</span>;
  if (status === 'failed') return <span className="badge bg-error/10 text-error">Failed</span>;
  return <span className="badge-pending">Pending</span>;
}

export function SuspendedBadge() {
  return <span className="badge bg-error/10 text-error">Suspended</span>;
}
