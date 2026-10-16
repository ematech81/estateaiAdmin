'use client';

import { FormEvent, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ApiClientError } from '@/lib/api';
import { uploadImage } from '@/lib/upload';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Spinner } from '@/components/ui/Spinner';
import type { AdminBlogPost, BlogPostInput } from '@/types/blog';

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  tags: string; // comma-separated in the UI
  coverImage: string;
  bodyMarkdown: string;
  status: 'draft' | 'published';
}

function toFormState(post?: AdminBlogPost): FormState {
  return {
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    tags: post?.tags.join(', ') ?? '',
    coverImage: post?.coverImage ?? '',
    bodyMarkdown: post?.bodyMarkdown ?? '',
    status: post?.status ?? 'draft',
  };
}

export function BlogPostForm({
  initial,
  onSubmit,
}: {
  initial?: AdminBlogPost;
  onSubmit: (input: BlogPostInput) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCoverUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      update('coverImage', url);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not upload the cover image.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim() || !form.bodyMarkdown.trim()) {
      setError('Title, excerpt, and body are all required.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        excerpt: form.excerpt.trim(),
        bodyMarkdown: form.bodyMarkdown,
        coverImage: form.coverImage || undefined,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        status: form.status,
      });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not save the post.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
      <label className="label-md flex flex-col gap-1 text-on-surface-variant">
        Title
        <input
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          className="input-standard"
          required
        />
      </label>

      <label className="label-md flex flex-col gap-1 text-on-surface-variant">
        Slug (optional — auto-generated from the title if left blank; changing it after publishing breaks the old URL)
        <input
          value={form.slug}
          onChange={(e) => update('slug', e.target.value)}
          placeholder="most-expensive-estates-in-nigeria"
          className="input-standard"
        />
      </label>

      <label className="label-md flex flex-col gap-1 text-on-surface-variant">
        Excerpt (shown on the blog index and used as the search-result description)
        <textarea
          value={form.excerpt}
          onChange={(e) => update('excerpt', e.target.value)}
          rows={2}
          maxLength={300}
          className="input-standard"
          required
        />
      </label>

      <label className="label-md flex flex-col gap-1 text-on-surface-variant">
        Tags (comma-separated)
        <input
          value={form.tags}
          onChange={(e) => update('tags', e.target.value)}
          placeholder="market-insights, guides"
          className="input-standard"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="label-md text-on-surface-variant">Cover image</span>
        {form.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element -- Cloudinary-hosted, not a next/image-configured domain
          <img src={form.coverImage} alt="" className="aspect-video w-full max-w-sm rounded-lg object-cover" />
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleCoverUpload(e.target.files);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn-tertiary self-start"
        >
          {uploading ? (
            <>
              <Spinner className="h-4 w-4" />
              Uploading…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
              {form.coverImage ? 'Replace image' : 'Upload image'}
            </>
          )}
        </button>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 border-b border-border-gray-200">
          <button
            type="button"
            onClick={() => setTab('write')}
            className={
              tab === 'write'
                ? 'label-md border-b-2 border-trust-blue-900 px-3 py-2 text-trust-blue-900'
                : 'label-md px-3 py-2 text-on-surface-variant'
            }
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={
              tab === 'preview'
                ? 'label-md border-b-2 border-trust-blue-900 px-3 py-2 text-trust-blue-900'
                : 'label-md px-3 py-2 text-on-surface-variant'
            }
          >
            Preview
          </button>
        </div>

        {tab === 'write' ? (
          <textarea
            value={form.bodyMarkdown}
            onChange={(e) => update('bodyMarkdown', e.target.value)}
            rows={16}
            placeholder="Write the post in Markdown — # headings, **bold**, - lists, [links](https://...)"
            className="input-standard font-mono text-body-md"
            required
          />
        ) : (
          <div className="markdown-body rounded-lg border border-border-gray-200 p-6 min-h-[24rem]">
            {form.bodyMarkdown.trim() ? (
              <ReactMarkdown>{form.bodyMarkdown}</ReactMarkdown>
            ) : (
              <p className="text-on-surface-variant">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>

      <label className="label-md flex flex-col gap-1 text-on-surface-variant">
        Status
        <select
          value={form.status}
          onChange={(e) => update('status', e.target.value as FormState['status'])}
          className="input-standard max-w-xs"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>

      {error && (
        <p role="alert" className="body-md text-error">
          {error}
        </p>
      )}

      <LoadingButton type="submit" loading={submitting} loadingText="Saving…" variant="primary" className="self-start">
        Save
      </LoadingButton>
    </form>
  );
}
