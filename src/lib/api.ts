import { clearToken, getToken } from './auth';
import type { AdminBlogPost, BlogPostInput } from '@/types/blog';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

// Fired when the API says our token is no longer good (expired, or the
// account was suspended / demoted) — AuthContext listens and signs out.
export const SESSION_EXPIRED_EVENT = 'estateai-admin-session-expired';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    if ((res.status === 401 || res.status === 403) && token && path !== '/auth/login') {
      clearToken();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    throw new ApiClientError(body.message ?? 'Request failed', res.status);
  }
  return body as T;
}

function qs(params: Record<string, string | number | boolean | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  const s = query.toString();
  return s ? `?${s}` : '';
}

// ------------------------------------------------------------------ types

export type Role = 'agent' | 'agency' | 'owner' | 'admin';
export type PlanTier = 'free' | 'basic' | 'premium';
export type IdentityStatus = 'unverified' | 'pending' | 'verified';
export type ListingStatus = 'draft' | 'pending_review' | 'active' | 'inactive';
export type UnavailableReason = 'sold' | 'rented' | 'withdrawn' | 'removed';

export interface MeUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Paged {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DailyPoint {
  date: string;
  value: number;
}

export interface Overview {
  days: number;
  users: {
    total: number;
    byRole: Record<string, number>;
    newInRange: number;
    emailVerified: number;
    identityVerified: number;
    suspended: number;
  };
  subscriptions: { activeBasic: number; activePremium: number };
  listings: {
    total: number;
    byStatus: Record<string, number>;
    activeByType: Record<string, number>;
    newInRange: number;
    removedByAdmin: number;
    topCities: { city: string; count: number }[];
  };
  revenue: {
    allTime: number;
    allTimePayments: number;
    inRange: number;
    paymentsInRange: number;
    failedInRange: number;
    pending: number;
  };
  engagement: { views: number; uniqueVisitors: number; contactClicks: number; contactReveals: number };
  daily: { signups: DailyPoint[]; listings: DailyPoint[]; views: DailyPoint[]; revenue: DailyPoint[] };
  topListings: { id: string; title: string; city?: string; agent?: string; views: number }[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  businessName?: string;
  primaryLocation?: string;
  verificationStatus: IdentityStatus;
  emailVerified: boolean;
  planTier: PlanTier;
  planExpiresAt?: string;
  suspended: boolean;
  suspendedAt?: string;
  suspensionReason?: string;
  createdAt: string;
}

export interface AdminUserRow extends AdminUser {
  listingCount: number;
  activeListingCount: number;
}

export interface UserDetail {
  user: AdminUser;
  listings: {
    id: string;
    title: string;
    status: ListingStatus;
    listingType: string;
    price: { amount: number; currency: string; period: string };
    city: string;
    unavailableReason?: UnavailableReason;
    createdAt: string;
  }[];
  payments: PaymentRow[];
  engagement: { views: number; contactClicks: number; contactReveals: number };
}

export interface AdminListing {
  id: string;
  title: string;
  status: ListingStatus;
  listingType: string;
  propertyType: string;
  price: { amount: number; currency: string; period: string };
  city: string;
  state?: string;
  photo?: string;
  unavailableReason?: UnavailableReason;
  views: number;
  createdAt: string;
  agent: { id: string; name: string; email: string; suspended: boolean } | null;
}

export interface PaymentRow {
  id: string;
  plan: 'basic' | 'premium';
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  reference: string;
  createdAt: string;
  user?: { id: string; name: string; email: string } | null;
}

export interface ActivityRow {
  id: string;
  type: string;
  targetType: 'user' | 'listing' | 'blog';
  targetId: string;
  targetLabel: string;
  note?: string;
  createdAt: string;
  admin: { name: string; email: string } | null;
}

// -------------------------------------------------------------------- api

export const api = {
  login: (input: { email: string; password: string }) =>
    request<{ token: string; user: MeUser }>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),

  getMe: () => request<{ user: MeUser }>('/users/me'),

  getOverview: (days: 7 | 30 | 90) => request<Overview>(`/admin/overview${qs({ days })}`),

  listUsers: (params: {
    search?: string;
    role?: string;
    plan?: string;
    emailVerified?: boolean;
    suspended?: boolean;
    verification?: string;
    page?: number;
  }) => request<{ users: AdminUserRow[] } & Paged>(`/admin/users${qs({ ...params, limit: 20 })}`),

  getUser: (id: string) => request<UserDetail>(`/admin/users/${id}`),

  setVerification: (id: string, status: IdentityStatus) =>
    request<{ user: AdminUser }>(`/admin/users/${id}/verification`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  setSuspension: (id: string, suspended: boolean, reason?: string) =>
    request<{ user: AdminUser }>(`/admin/users/${id}/suspension`, {
      method: 'PATCH',
      body: JSON.stringify({ suspended, reason }),
    }),

  listListings: (params: {
    search?: string;
    status?: string;
    listingType?: string;
    removed?: boolean;
    agentId?: string;
    page?: number;
  }) => request<{ listings: AdminListing[] } & Paged>(`/admin/listings${qs({ ...params, limit: 20 })}`),

  moderateListing: (id: string, action: 'remove' | 'restore', note?: string) =>
    request<{ listing: { id: string; status: ListingStatus; unavailableReason?: UnavailableReason } }>(
      `/admin/listings/${id}/moderation`,
      { method: 'PATCH', body: JSON.stringify({ action, note }) },
    ),

  listPayments: (params: { status?: string; plan?: string; page?: number }) =>
    request<
      { payments: PaymentRow[]; totalsByStatus: Record<string, { amount: number; count: number }> } & Paged
    >(`/admin/payments${qs({ ...params, limit: 20 })}`),

  listActivity: (page = 1) => request<{ actions: ActivityRow[] } & Paged>(`/admin/activity${qs({ page, limit: 25 })}`),

  // Blog — the same admin endpoints the public site used to host.
  listAllBlogPosts: () => request<{ posts: AdminBlogPost[] }>('/blog-admin'),
  getBlogPostAdmin: (id: string) => request<{ post: AdminBlogPost }>(`/blog-admin/${id}`),
  createBlogPost: (input: BlogPostInput) =>
    request<{ post: AdminBlogPost }>('/blog-admin', { method: 'POST', body: JSON.stringify(input) }),
  updateBlogPost: (id: string, input: Partial<BlogPostInput>) =>
    request<{ post: AdminBlogPost }>(`/blog-admin/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteBlogPost: (id: string) => request<Record<string, never>>(`/blog-admin/${id}`, { method: 'DELETE' }),

  // Used by the blog editor's cover-image upload.
  getUploadSignature: () =>
    request<{ timestamp: number; signature: string; apiKey: string; cloudName: string; folder: string }>(
      '/uploads/signature',
      { method: 'POST' },
    ),
};
