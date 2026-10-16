'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/ui/PageLoader';

const NAV = [
  { href: '/', label: 'Overview', icon: 'dashboard' },
  { href: '/users', label: 'Users', icon: 'group' },
  { href: '/listings', label: 'Listings', icon: 'home_work' },
  { href: '/payments', label: 'Payments', icon: 'payments' },
  { href: '/blog', label: 'Blog', icon: 'article' },
  { href: '/activity', label: 'Activity log', icon: 'history' },
];

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

// Guards every page inside it: no admin session -> /login. The API enforces
// the same rule on every request; this just keeps the UI honest.
export function Shell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <PageLoader label="Loading…" />
      </div>
    );
  }

  const nav = (
    <ul className="flex flex-col gap-1">
      {NAV.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={
              isActive(pathname, item.href)
                ? 'flex items-center gap-3 rounded-xl bg-secondary-container px-4 py-3 font-bold text-on-secondary-container'
                : 'flex items-center gap-3 rounded-xl px-4 py-3 text-on-surface-variant transition-colors hover:bg-surface-container-high'
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="label-md">{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );

  const account = (
    <div className="border-t border-border-gray-200 px-4 pt-4">
      <p className="label-md truncate font-bold text-primary">{user.name}</p>
      <p className="label-sm truncate text-on-surface-variant">{user.email}</p>
      <button
        type="button"
        onClick={() => {
          logout();
          router.replace('/login');
        }}
        className="label-md mt-3 flex items-center gap-2 text-error hover:opacity-80"
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        Log out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-border-gray-200 bg-surface-gray-50 py-stack-lg md:flex">
        <div className="mb-8 px-gutter">
          <h1 className="headline-md font-bold text-primary">EstateAI</h1>
          <p className="label-sm text-on-surface-variant">Admin dashboard</p>
        </div>
        <div className="flex-grow px-4">{nav}</div>
        {account}
      </aside>

      {/* Mobile top bar + slide-down menu */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border-gray-200 bg-surface-container-lowest px-margin-mobile md:hidden">
        <span className="headline-md font-bold text-primary">EstateAI Admin</span>
        <button type="button" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>
          <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
        </button>
      </header>
      {menuOpen && (
        <div className="fixed inset-x-0 top-16 z-30 border-b border-border-gray-200 bg-surface-container-lowest p-4 shadow-lg md:hidden">
          {nav}
          <div className="mt-4">{account}</div>
        </div>
      )}

      <main className="md:ml-64">
        <div className="mx-auto max-w-container-max px-margin-mobile py-stack-lg md:px-gutter">{children}</div>
      </main>
    </div>
  );
}
