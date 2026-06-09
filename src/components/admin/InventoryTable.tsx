import { useState, useMemo, useCallback, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type Table,
} from '@tanstack/react-table'
import { httpsCallable } from 'firebase/functions'
import { doc, updateDoc } from 'firebase/firestore'
import { db, functions } from '../../lib/firebase'
import AiAssistantPanel from './AiAssistantPanel'
import MarkdownConfigPanel from './MarkdownConfigPanel'
import {
  buildColumns,
  DEFAULT_HIDDEN_COLUMNS,
  EDITABLE_COLUMN_IDS,
  type AiOpStatus,
  type NavDirection,
} from './InventoryTable/columns'
import type { Item } from '../../lib/types'
import { useGridClipboard } from '../../hooks/useGridClipboard'

// ---------------------------------------------------------------------------
// Batch process payload types
// ---------------------------------------------------------------------------

interface BatchProcessPayload {
  itemIds: string[]
  operations: ('description' | 'price')[]
}

interface BatchProcessResult {
  processed: string[]
  failed: Record<string, string>
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface InventoryTableProps {
  items: Item[]
  isAdmin: boolean
  onApplyTitle: (itemId: string, title: string) => Promise<void>
  onApplyCategory: (itemId: string, category: string) => Promise<void>
  onApplyDescription: (itemId: string, draft: string) => Promise<void>
  onApplyTags: (itemId: string, tags: string[]) => Promise<void>
  onApplyPrice: (itemId: string, low: number, high: number) => Promise<void>
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InventoryTable({
  items,
  isAdmin,
  onApplyTitle,
  onApplyCategory,
  onApplyDescription,
  onApplyTags,
  onApplyPrice,
}: InventoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(DEFAULT_HIDDEN_COLUMNS)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null)
  const [drawerItem, setDrawerItem] = useState<Item | null>(null)
  const [aiStatus, setAiStatus] = useState<Record<string, AiOpStatus>>({})
  const [showColumnPanel, setShowColumnPanel] = useState(false)
  const [batchError, setBatchError] = useState<string | null>(null)
  const [batchLoading, setBatchLoading] = useState(false)

  const { copyValue } = useGridClipboard()

  // Stable ref to the table instance — avoids circular dep between onNavigate
  // and the table object (table is defined after onNavigate in render order).
  const tableRef = useRef<Table<Item> | null>(null)

  // ---------------------------------------------------------------------------
  // Cell save — writes changed field(s) to Firestore
  // ---------------------------------------------------------------------------

  const onCellSave = useCallback(async (rowId: string, field: string, value: unknown) => {
    const item = items.find(i => i.id === rowId)
    if (!item) return
    try {
      await updateDoc(doc(db, 'items', item.id), { [field]: value })
    } catch (err) {
      alert(`Save failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [items])

  // ---------------------------------------------------------------------------
  // Cell navigation (Tab / Shift-Tab between editable cells)
  // ---------------------------------------------------------------------------

  const onNavigate = useCallback((rowId: string, colId: string, direction: NavDirection) => {
    const t = tableRef.current
    if (!t) return
    const rows = t.getRowModel().rows
    const rowIdx = rows.findIndex(r => r.id === rowId)
    if (rowIdx === -1) return
    const row = rows[rowIdx]
    const visibleEditableCells = row.getVisibleCells().filter(c => EDITABLE_COLUMN_IDS.includes(c.column.id))
    const colIdx = visibleEditableCells.findIndex(c => c.column.id === colId)

    if (direction === 'tab') {
      if (colIdx < visibleEditableCells.length - 1) {
        setEditingCell({ rowId, colId: visibleEditableCells[colIdx + 1].column.id })
      } else if (rowIdx < rows.length - 1) {
        const nextRow = rows[rowIdx + 1]
        const nextCells = nextRow.getVisibleCells().filter(c => EDITABLE_COLUMN_IDS.includes(c.column.id))
        if (nextCells.length > 0) setEditingCell({ rowId: nextRow.id, colId: nextCells[0].column.id })
      } else {
        setEditingCell(null)
      }
    } else {
      if (colIdx > 0) {
        setEditingCell({ rowId, colId: visibleEditableCells[colIdx - 1].column.id })
      } else if (rowIdx > 0) {
        const prevRow = rows[rowIdx - 1]
        const prevCells = prevRow.getVisibleCells().filter(c => EDITABLE_COLUMN_IDS.includes(c.column.id))
        if (prevCells.length > 0) setEditingCell({ rowId: prevRow.id, colId: prevCells[prevCells.length - 1].column.id })
      } else {
        setEditingCell(null)
      }
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Per-row AI trigger (single item) — opens drawer after dispatch
  // ---------------------------------------------------------------------------

  const triggerAi = useCallback(async (item: Item, op: 'description' | 'price') => {
    setAiStatus(prev => ({ ...prev, [item.id]: 'loading' }))
    setDrawerItem(item)
    try {
      if (op === 'description') {
        const fn = httpsCallable(functions, 'generateAIDescription')
        await fn({
          itemId: item.id,
          title: item.title,
          category: item.category,
          viewTag: item.viewTag,
          condition: item.condition,
          provenanceNotes: item.provenanceNotes,
          serialNumber: item.serialNumber,
          staffNotes: '',
          images: item.images?.length ? item.images : undefined,
        })
      } else {
        const fn = httpsCallable(functions, 'suggestAiPrice')
        await fn({
          itemId: item.id,
          title: item.title,
          category: item.category,
          condition: item.condition,
          brandModel: '',
          staffNotes: '',
        })
      }
      setAiStatus(prev => ({ ...prev, [item.id]: 'done' }))
    } catch {
      setAiStatus(prev => ({ ...prev, [item.id]: 'error' }))
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Batch AI — dispatches batchProcessItems CF for selected rows
  // ---------------------------------------------------------------------------

  const runBatchAi = useCallback(async (operations: ('description' | 'price')[]) => {
    const selectedRows = tableRef.current?.getSelectedRowModel().rows ?? []
    if (selectedRows.length === 0) return
    const itemIds = selectedRows.map(r => r.original.id)

    // Mark all selected items as loading
    setAiStatus(prev => {
      const next = { ...prev }
      itemIds.forEach(id => { next[id] = 'loading' })
      return next
    })
    setBatchLoading(true)
    setBatchError(null)

    try {
      const fn = httpsCallable<BatchProcessPayload, BatchProcessResult>(functions, 'batchProcessItems')
      const result = await fn({ itemIds, operations })
      const { processed, failed } = result.data

      setAiStatus(prev => {
        const next = { ...prev }
        processed.forEach(id => { next[id] = 'done' })
        Object.keys(failed).forEach(id => { next[id] = 'error' })
        return next
      })

      const failCount = Object.keys(failed).length
      if (failCount > 0) {
        setBatchError(`${processed.length} succeeded, ${failCount} failed. Check the AI column for details.`)
      }
    } catch (err) {
      setAiStatus(prev => {
        const next = { ...prev }
        itemIds.forEach(id => { next[id] = 'error' })
        return next
      })
      setBatchError(err instanceof Error ? err.message : 'Batch AI failed.')
    } finally {
      setBatchLoading(false)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Column definitions (memo-stable as they don't depend on changing state)
  // ---------------------------------------------------------------------------

  const columns = useMemo(() => buildColumns(), [])

  // ---------------------------------------------------------------------------
  // Table instance
  // ---------------------------------------------------------------------------

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: items,
    columns,
    state: { sorting, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      editingCell,
      setEditingCell,
      onCellSave,
      onNavigate,
      isAdmin,
      onOpenDrawer: setDrawerItem,
      copyValue,
      triggerAi,
      aiStatus,
    },
  })

  tableRef.current = table

  const selectedCount = table.getSelectedRowModel().rows.length

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div style={{ position: 'relative' }}>

      {/* ---- Toolbar ---- */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: 'var(--space-3)',
        gap: 'var(--space-2)',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {items.length} items
        </span>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowColumnPanel(p => !p)}
            aria-expanded={showColumnPanel}
            aria-controls="column-visibility-panel"
            style={{
              minHeight: '36px',
              padding: '0 var(--space-3)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
            }}
          >
            Columns ▾
          </button>
          {showColumnPanel && (
            <div
              id="column-visibility-panel"
              style={{
                position: 'absolute',
                top: 'calc(100% + var(--space-1))',
                right: 0,
                zIndex: 300,
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                minWidth: '180px',
                boxShadow: '0 var(--space-2) var(--space-8) rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-1)',
              }}
            >
              {table.getAllColumns().filter(c => c.getCanHide()).map(col => (
                <label
                  key={col.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    padding: 'var(--space-1)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={col.getToggleVisibilityHandler()}
                    style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                  />
                  {typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---- Table ---- */}
      <div
        role="grid"
        aria-label="Inventory table"
        style={{
          overflowX: 'auto',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
        }}
        onClick={() => setShowColumnPanel(false)}
      >
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          backgroundColor: 'var(--color-surface)',
        }}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} role="row">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    role="columnheader"
                    aria-sort={
                      header.column.getIsSorted() === 'asc' ? 'ascending'
                        : header.column.getIsSorted() === 'desc' ? 'descending'
                        : 'none'
                    }
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      padding: 'var(--space-3) var(--space-3)',
                      textAlign: 'left',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      backgroundColor: 'var(--color-bg)',
                      borderBottom: '1px solid var(--color-border)',
                      whiteSpace: 'nowrap',
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && ' ↑'}
                        {header.column.getIsSorted() === 'desc' && ' ↓'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIdx) => (
              <tr
                key={row.id}
                role="row"
                aria-selected={row.getIsSelected()}
                style={{
                  backgroundColor: row.getIsSelected()
                    ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
                    : rowIdx % 2 === 0 ? 'var(--color-surface)' : 'color-mix(in srgb, var(--color-bg) 60%, var(--color-surface) 40%)',
                  transition: `background-color var(--motion-speed-fast) var(--motion-easing)`,
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    role="gridcell"
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      borderBottom: '1px solid var(--color-border)',
                      verticalAlign: 'middle',
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length}
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-12) 0',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--text-small)',
                  }}
                >
                  No items to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---- Batch Action Bar (fixed bottom, appears on selection) ---- */}
      {selectedCount > 0 && (
        <div
          role="toolbar"
          aria-label="Batch actions"
          style={{
            position: 'fixed',
            bottom: 'var(--space-6)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-6)',
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 var(--space-2) var(--space-8) rgba(0,0,0,0.5)',
          }}
        >
          <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {selectedCount} selected
          </span>
          <button
            type="button"
            disabled={batchLoading}
            onClick={() => runBatchAi(['description'])}
            style={{
              minHeight: '36px',
              padding: '0 var(--space-3)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: 'var(--text-small)',
              cursor: batchLoading ? 'not-allowed' : 'pointer',
              opacity: batchLoading ? 0.6 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            ✨ Generate Descriptions
          </button>
          <button
            type="button"
            disabled={batchLoading}
            onClick={() => runBatchAi(['price'])}
            style={{
              minHeight: '36px',
              padding: '0 var(--space-3)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: 'var(--text-small)',
              cursor: batchLoading ? 'not-allowed' : 'pointer',
              opacity: batchLoading ? 0.6 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            $ Suggest Prices
          </button>
          <button
            type="button"
            onClick={() => table.resetRowSelection()}
            style={{
              minHeight: '36px',
              padding: '0 var(--space-3)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'transparent',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-small)',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
          {batchError && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', maxWidth: '240px' }}>
              {batchError}
            </span>
          )}
        </div>
      )}

      {/* ---- AI / Markdown Drawer ---- */}
      {drawerItem && (
        <>
          <div
            aria-hidden="true"
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
            onClick={() => setDrawerItem(null)}
          />
          <aside
            aria-label={`AI Assistant — ${drawerItem.title}`}
            style={{
              position: 'fixed',
              top: 0, right: 0, bottom: 0,
              width: '400px',
              maxWidth: '100vw',
              backgroundColor: 'var(--color-bg)',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
              zIndex: 1000,
              overflowY: 'auto',
              borderLeft: '1px solid var(--color-border)',
              animation: 'slideInRight 0.3s ease-out',
            }}
          >
            <div style={{
              padding: 'var(--space-4)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              backgroundColor: 'var(--color-bg)',
              zIndex: 10,
            }}>
              <div>
                <h2 style={{ fontSize: 'var(--text-small)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                  AI Assistant
                </h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0, marginTop: 'var(--space-1)' }}>
                  {drawerItem.title}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close AI drawer"
                onClick={() => setDrawerItem(null)}
                style={{ background: 'none', border: 'none', fontSize: 'var(--text-subheading)', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: 'var(--space-4)' }}>
              <AiAssistantPanel
                item={drawerItem}
                onApplyTitle={title => onApplyTitle(drawerItem.id, title)}
                onApplyCategory={category => onApplyCategory(drawerItem.id, category)}
                onApplyDescription={draft => onApplyDescription(drawerItem.id, draft)}
                onApplyTags={tags => onApplyTags(drawerItem.id, tags)}
                onApplyPrice={(low, high) => onApplyPrice(drawerItem.id, low, high)}
              />
              <div style={{ marginTop: 'var(--space-4)' }}>
                <MarkdownConfigPanel item={drawerItem} onConfigured={() => {}} />
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
