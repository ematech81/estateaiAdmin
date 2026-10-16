import { Spinner } from './Spinner';

// Page/section-level loading state (e.g. "fetching listings") — the
// full-area counterpart to LoadingButton's inline spinner. Use this instead
// of a bare "Loading…" string so every loading state in the app looks the
// same.
export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-stack-sm py-stack-lg text-on-surface-variant"
    >
      <Spinner className="h-6 w-6" />
      <span className="body-md">{label}</span>
    </div>
  );
}
