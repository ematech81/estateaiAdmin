'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ApiClientError } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { PageLoader } from '@/components/ui/PageLoader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { AdminBlogPost } from '@/types/blog';

export default function BlogListPage() {
  const [posts, setPosts] = useState<AdminBlogPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AdminBlogPost | null>(null);

  useEffect(() => {
    api
      .listAllBlogPosts()
      .then((res) => setPosts(res.posts))
      .catch((err) => setError(err instanceof ApiClientError ? err.message : 'Could not load posts.'));
  }, []);

  return (
    <div className="space-y-stack-md">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="headline-lg-mobile md:headline-lg font-bold text-primary">Blog</h1>
          <p className="body-md mt-1 text-on-surface-variant">Articles shown on the public site’s blog.</p>
        </div>
        <Link href="/blog/new" className="btn-primary shrink-0">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New post
        </Link>
      </div>

      {error && <p className="body-md text-error">{error}</p>}
      {posts === null && !error && <PageLoader label="Loading posts…" />}

      {posts?.length === 0 && (
        <div className="rounded-xl border border-dashed border-border-gray-200 p-10 text-center">
          <p className="body-md text-on-surface-variant">No posts yet.</p>
        </div>
      )}

      {posts && posts.length > 0 && (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li
              key={post._id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border-gray-200 bg-surface-container-lowest p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className={post.status === 'published' ? 'badge-verified' : 'badge-pending'}>{post.status}</span>
                  <p className="body-md truncate font-semibold text-on-surface">{post.title}</p>
                </div>
                <p className="label-sm mt-1 font-normal text-on-surface-variant">
                  /blog/{post.slug} · updated {formatDate(post.updatedAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link href={`/blog/${post._id}`} className="btn-tertiary">
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setToDelete(post)}
                  className="label-md rounded px-3 py-2 text-error transition-colors hover:bg-error/10"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete this post?"
          confirmLabel="Delete post"
          danger
          onCancel={() => setToDelete(null)}
          onConfirm={async () => {
            await api.deleteBlogPost(toDelete._id);
            setPosts((prev) => prev?.filter((p) => p._id !== toDelete._id) ?? prev);
            setToDelete(null);
          }}
        >
          <strong className="text-on-surface">{toDelete.title}</strong> will be deleted permanently. This can’t be undone.
        </ConfirmDialog>
      )}
    </div>
  );
}
