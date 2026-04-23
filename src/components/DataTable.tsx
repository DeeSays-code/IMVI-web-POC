import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface ColumnDef<T> {
  /** Unique key for this column — used for React key and sort state. */
  key: string;
  /** Rendered header label. */
  header: string;
  /** Cell renderer. Receives the full row. */
  render: (row: T) => React.ReactNode;
  /** CSS width — "200px", "1fr", "minmax(0, 2fr)", etc. Defaults to 1fr. */
  width?: string;
  align?: 'left' | 'right' | 'center';
  /** When provided, column becomes sortable. Return a comparable value. */
  sortValue?: (row: T) => string | number;
}

export interface DataTableProps<T> {
  rows: ReadonlyArray<T>;
  columns: ReadonlyArray<ColumnDef<T>>;
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  /** Initial sort — column key + direction. */
  initialSort?: { key: string; direction: 'asc' | 'desc' };
}

/**
 * Generic data table per web spec §2.3 · Data tables:
 *   ink-2 bg, 1px bone-muted 8% dividers, Oswald headers, 56px rows.
 * Accepts column definitions and handles sort state internally.
 * Used by User Management, Bulk Onboarding preview, Sponsorship Assignments,
 * Permission Matrix.
 */
export function DataTable<T>({
  rows,
  columns,
  getRowKey,
  onRowClick,
  emptyState,
  initialSort,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<
    { key: string; direction: 'asc' | 'desc' } | null
  >(initialSort ?? null);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const signed = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va < vb) return -1 * signed;
      if (va > vb) return 1 * signed;
      return 0;
    });
  }, [rows, columns, sort]);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, direction: 'asc' };
      return prev.direction === 'asc'
        ? { key, direction: 'desc' }
        : null;
    });
  };

  const gridTemplate = columns.map((c) => c.width ?? '1fr').join(' ');

  if (rows.length === 0 && emptyState) {
    return <div className="rounded-[14px] border border-bone-muted/8 bg-ink-2">{emptyState}</div>;
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-bone-muted/8 bg-ink-2">
      {/* header */}
      <div
        className="grid items-center gap-x-6 border-b border-bone-muted/8 px-5 py-3"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {columns.map((col) => {
          const sortable = !!col.sortValue;
          const isSortedByThis = sort?.key === col.key;
          return (
            <button
              key={col.key}
              type="button"
              onClick={() => sortable && toggleSort(col.key)}
              disabled={!sortable}
              className={`flex items-center gap-1 font-display text-[11px] font-medium uppercase tracking-label-lg ${
                col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
              } ${sortable ? 'cursor-pointer text-bone-muted transition-colors hover:text-bone' : 'cursor-default text-bone-muted'}`}
              aria-sort={
                isSortedByThis
                  ? sort.direction === 'asc' ? 'ascending' : 'descending'
                  : sortable ? 'none' : undefined
              }
            >
              <span>{col.header}</span>
              {sortable && isSortedByThis && (
                sort.direction === 'asc'
                  ? <ChevronUp size={12} strokeWidth={2} />
                  : <ChevronDown size={12} strokeWidth={2} />
              )}
            </button>
          );
        })}
      </div>

      {/* rows */}
      <div>
        {sortedRows.map((row) => (
          <div
            key={getRowKey(row)}
            role={onRowClick ? 'button' : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            onKeyDown={
              onRowClick
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onRowClick(row);
                    }
                  }
                : undefined
            }
            className={`grid items-center gap-x-6 border-b border-bone-muted/5 px-5 py-0 last:border-b-0 ${
              onRowClick ? 'cursor-pointer transition-colors hover:bg-ink-3/60' : ''
            }`}
            style={{ gridTemplateColumns: gridTemplate, minHeight: 56 }}
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className={`py-3 font-body text-[13px] font-light text-bone ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {col.render(row)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
