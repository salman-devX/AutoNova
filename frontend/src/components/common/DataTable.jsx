import { MoreVertical } from 'lucide-react';
import { cn } from '../../utils/cn';
import { EmptyState } from './States';

/**
 * columns: [{ key, header, render?(row), className? }]
 * On mobile (<lg), rows collapse into stacked cards instead of a horizontal-scroll table.
 */
export function DataTable({ columns, data = [], keyField = 'id', onRowClick, emptyLabel = 'No records found' }) {
  if (!data.length) return <EmptyState title={emptyLabel} />;
  // Real MongoDB documents use `_id`; mock data used `id`. Try the caller's
  // preferred field first, then fall back to whichever one actually exists.
  const rowKey = (row) => row[keyField] ?? row._id ?? row.id;

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-hairline-2 lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline-2 bg-glass-1">
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-hairline-1 transition-colors last:border-0 hover:bg-glass-1',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3.5 text-ink-2', col.className)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 lg:hidden">
        {data.map((row) => (
          <div
            key={rowKey(row)}
            onClick={() => onRowClick?.(row)}
            className={cn('glass-card space-y-2', onRowClick && 'cursor-pointer active:scale-[0.99] transition-transform')}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">{col.header}</span>
                <span className="text-right text-ink-2">{col.render ? col.render(row) : row[col.key]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export function RowActions({ children }) {
  return (
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
}
