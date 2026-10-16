'use client';

import { useState } from 'react';

// Daily series as a single-colour bar chart. One series per chart, so no
// legend is needed (the card title names it). Bars have a hover/focus
// readout and there's a table fallback for keyboard / screen-reader users.
const CHART_HEIGHT = 140;

function formatDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function DailyChart({
  data,
  unit,
  format = (n) => n.toLocaleString(),
  color = '#0F172A',
}: {
  data: { date: string; value: number }[];
  /** Singular noun used in the hover readout, e.g. "view". */
  unit: string;
  format?: (n: number) => string;
  color?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [tableOpen, setTableOpen] = useState(false);

  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const hovered = hover != null ? data[hover] : null;
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  return (
    <div>
      <div className="label-sm mb-2 h-5 font-normal text-on-surface-variant">
        {hovered ? (
          <>
            <span className="font-bold text-on-surface">
              {format(hovered.value)} {unit}
              {hovered.value === 1 ? '' : 's'}
            </span>{' '}
            · {formatDay(hovered.date)}
          </>
        ) : (
          <>
            <span className="font-bold text-on-surface">{format(total)}</span> total
          </>
        )}
      </div>

      <div className="flex items-end gap-[2px] border-b border-border-gray-200" style={{ height: CHART_HEIGHT }}>
        {data.map((d, i) => (
          <div
            key={d.date}
            className="flex h-full flex-1 items-end"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            tabIndex={0}
            role="img"
            aria-label={`${formatDay(d.date)}: ${format(d.value)} ${unit}${d.value === 1 ? '' : 's'}`}
          >
            <div
              className="w-full rounded-t-sm"
              style={{
                height: d.value === 0 ? 2 : `${(d.value / max) * 100}%`,
                backgroundColor: color,
                opacity: d.value === 0 ? 0.15 : hover === i ? 1 : 0.8,
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-1 flex gap-[2px]">
        {data.map((d, i) => (
          <div key={d.date} className="label-sm flex-1 text-center font-normal text-on-surface-variant">
            {i % labelEvery === 0 ? <span className="whitespace-nowrap">{formatDay(d.date)}</span> : null}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setTableOpen((v) => !v)}
        className="label-sm mt-3 font-normal text-on-surface-variant underline"
      >
        {tableOpen ? 'Hide' : 'View'} as table
      </button>
      {tableOpen && (
        <table className="mt-2 w-full text-left text-label-sm">
          <thead>
            <tr className="border-b border-border-gray-200 text-on-surface-variant">
              <th className="py-1">Day</th>
              <th className="py-1 text-right">{unit.charAt(0).toUpperCase() + unit.slice(1)}s</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.date} className="border-b border-border-gray-200 last:border-0">
                <td className="py-1 text-on-surface">{formatDay(d.date)}</td>
                <td className="py-1 text-right text-on-surface">{format(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
