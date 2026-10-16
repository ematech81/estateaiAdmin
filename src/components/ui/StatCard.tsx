// One stat tile. `value` is a ready-formatted string (or null while loading,
// which renders "…" — never a made-up placeholder number). `hint` is the
// small grey line under it, e.g. "+12 in the last 30 days".
export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = 'default',
}: {
  icon: string;
  label: string;
  value: string | null;
  hint?: string;
  tone?: 'default' | 'warning';
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-border-gray-200 bg-surface-container-lowest p-5">
      <div
        className={`mb-3 w-fit rounded-lg p-2 ${
          tone === 'warning' ? 'bg-error/10 text-error' : 'bg-surface-container-low text-trust-blue-900'
        }`}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="label-md text-on-surface-variant">{label}</p>
        <p className="headline-md mt-1 font-bold text-primary">{value ?? '…'}</p>
        {hint && <p className="label-sm mt-1 font-normal text-on-surface-variant">{hint}</p>}
      </div>
    </div>
  );
}
