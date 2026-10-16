'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { BlogPostForm } from '@/components/blog/BlogPostForm';

export default function NewBlogPostPage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl">
      <h1 className="headline-lg-mobile md:headline-lg mb-stack-lg font-bold text-primary">New post</h1>
      <BlogPostForm
        onSubmit={async (input) => {
          await api.createBlogPost(input);
          router.push('/blog');
        }}
      />
    </div>
  );
}
