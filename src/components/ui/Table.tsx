import { useState } from 'react'
import type { ReactNode } from 'react'

type SortDirection = 'asc' | 'desc'

interface Column<T> {
  key: keyof T & string
  header: string
  sortable?: boolean
  render?: (row: T) => ReactNode
}

interface TableProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  onSort?: (key: string, direction: SortDirection) => void
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  onSort,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection>('asc')

  function handleSortClick(key: string) {
    const newDir: SortDirection = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'
    setSortKey(key)
    setSortDir(newDir)
    onSort?.(key, newDir)
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.sortable ? 'sortable' : undefined}
                aria-sort={
                  col.sortable && sortKey === col.key
                    ? sortDir === 'asc' ? 'ascending' : 'descending'
                    : undefined
                }
                tabIndex={col.sortable ? 0 : undefined}
                onClick={col.sortable ? () => handleSortClick(col.key) : undefined}
                onKeyDown={col.sortable
                  ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSortClick(col.key) } }
                  : undefined
                }
              >
                {col.header}
                {col.sortable && sortKey === col.key && (
                  <span aria-hidden="true"> {sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
