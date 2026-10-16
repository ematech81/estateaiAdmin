'use client';

import { ReactNode, useEffect, useState } from 'react';
import { LoadingButton } from './LoadingButton';

// A confirmation step for every consequential admin action (suspend, remove
// a listing…). Optionally collects a short reason, which is stored with the
// action in the activity log.
export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  danger = false,
  askReason = false,
  reasonLabel = 'Reason (optional)',
  onConfirm,
  onCancel,
}: {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  askReason?: boolean;
  reasonLabel?: string;
  onConfirm: (reason: string | undefined) => Promise<void>;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [busy, onCancel]);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm(reason.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !busy && onCancel()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-xl bg-surface-container-lowest p-stack-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="headline-md mb-2 text-on-surface">{title}</h3>
        <div className="body-md text-on-surface-variant">{children}</div>

        {askReason && (
          <label className="label-md mt-stack-sm flex flex-col gap-1 text-on-surface-variant">
            {reasonLabel}
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
              className="input-standard"
            />
          </label>
        )}

        {error && <p className="body-md mt-3 text-error">{error}</p>}

        <div className="mt-stack-md flex gap-3">
          <button type="button" className="btn-tertiary flex-1" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <LoadingButton
            loading={busy}
            loadingText="Working…"
            onClick={confirm}
            className={`flex-1 ${danger ? '!bg-error hover:!bg-error/90' : ''}`}
          >
            {confirmLabel}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
