'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { PageLoader } from '@/components/ui/PageLoader';
import { BlogPostForm } from '@/components/blog/BlogPostForm';
import type { AdminBlogPost } from '@/types/blog';

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<AdminBlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getBlogPostAdmin(id)
      .then((res) => setPost(res.post))
      .catch((err) => setError(err instanceof ApiClientError ? err.message : 'Could not load this post.'));
  }, [id]);

  return (
    <div className="max-w-3xl">
      <h1 className="headline-lg-mobile md:headline-lg mb-stack-lg font-bold text-primary">Edit post</h1>

      {error && <p className="body-md text-error">{error}</p>}
      {!post && !error && <PageLoader label="Loading post…" />}

      {post && (
        <BlogPostForm
          initial={post}
          onSubmit={async (input) => {
            await api.updateBlogPost(post._id, input);
            router.push('/blog');
          }}
        />
      )}
    </div>
  );
}
