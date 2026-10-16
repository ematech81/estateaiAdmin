// Mirrors the backend canonical shape (api/src/models/BlogPost.ts). Kept in
// sync by hand for now — same convention as types/property.ts.

export type BlogPostStatus = 'draft' | 'published';

// What the public GET /api/blog list endpoint returns per item — the
// backend's toPublicPost() only ever strips `author`, so bodyMarkdown is
// actually present here too (used to derive read time client-side, see
// lib/readTime.ts, rather than adding a backend field for it).
export interface BlogPostSummary {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyMarkdown: string;
  coverImage?: string;
  tags: string[];
  publishedAt: string;
}

// Same shape as the list — GET /api/blog/:slug returns one full post, not a
// reduced one.
export type BlogPost = BlogPostSummary;

// What the admin-only /api/blog-admin endpoints return — every status, plus
// fields the public shape strips.
export interface AdminBlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyMarkdown: string;
  coverImage?: string;
  tags: string[];
  status: BlogPostStatus;
  author: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostInput {
  title: string;
  slug?: string;
  excerpt: string;
  bodyMarkdown: string;
  coverImage?: string;
  tags: string[];
  status: BlogPostStatus;
}
