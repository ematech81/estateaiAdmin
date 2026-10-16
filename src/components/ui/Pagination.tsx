export function Pagination({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
}) {
  if (total === 0) return null;
  return (
    <div className="mt-stack-md flex items-center justify-between">
      <p className="label-md font-normal text-on-surface-variant">
        {total.toLocaleString()} result{total === 1 ? '' : 's'} · page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button type="button" className="btn-tertiary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </button>
        <button type="button" className="btn-tertiary" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
