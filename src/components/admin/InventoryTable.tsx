import { useState, useMemo, useCallback, useRef, type Dispatch, type SetStateAction, type ReactNode } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type Table,
  type Row,
} from '@tanstack/react-table'

// ---------------------------------------------------------------------------
// GroupBy — exported so InventoryPage can share the type
// ---------------------------------------------------------------------------

export type GroupBy = 'none' | 'viewTag' | 'category' | 'status'

const GROUP_DISPLAY_ORDER: Partial<Record<GroupBy, Record<string, number>>> = {
  status:  { draft: 0, active: 1, reserved: 2, sold: 3, archived: 4, deleted: 5 },
  viewTag: { pawn: 0, cannabis: 1, fireworks: 2, tobacco: 3, other: 4 },
}

function groupKey(item: Item, by: GroupBy): string {
  if (by === 'viewTag')  return item.viewTag  || 'other'
  if (by === 'category') return item.category || 'uncategorized'
  if (by === 'status')   return item.status
  return '__all__'
}

function formatGroupLabel(key: string): string {
  if (key === 'uncategorized') return 'Uncategorized'
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ')
}
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
// Table body renderer — handles flat and grouped layouts
// ---------------------------------------------------------------------------

function renderItemRow(row: Row<Item>, rowIdx: number) {
  return (
    <tr
      key={row.id}
      role="row"
      aria-selected={row.getIsSelected()}
      style={{
        backgroundColor: row.getIsSelected()
          ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
          : rowIdx % 2 === 0
            ? 'var(--color-surface)'
            : 'color-mix(in srgb, var(--color-bg) 60%, var(--color-surface) 40%)',
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
  )
}

function renderTableBody(
  rows: Row<Item>[],
  colCount: number,
  by: GroupBy,
  expandedGroups: Record<string, boolean>,
  setExpandedGroups: Dispatch<SetStateAction<Record<string, boolean>>>,
): ReactNode {
  if (rows.length === 0) {
    return (
      <tr>
        <td
          colSpan={colCount}
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
    )
  }

  if (by === 'none') {
    return rows.map((row, rowIdx) => renderItemRow(row, rowIdx))
  }

  // Build ordered groups from sorted rows
  const groupMap = new Map<string, Row<Item>[]>()
  for (const row of rows) {
    const key = groupKey(row.original, by)
    if (!groupMap.has(key)) groupMap.set(key, [])
    groupMap.get(key)!.push(row)
  }

  const order = GROUP_DISPLAY_ORDER[by] ?? {}
  const sortedKeys = [...groupMap.keys()].sort(
    (a, b) => (order[a] ?? 999) - (order[b] ?? 999) || a.localeCompare(b),
  )

  return sortedKeys.flatMap(key => {
    const groupRows = groupMap.get(key)!
    const isExpanded = expandedGroups[key] !== false // undefined → expanded
    const label = formatGroupLabel(key)

    return [
      <tr key={`grp-${key}`} style={{ backgroundColor: 'var(--color-bg)' }}>
        <td
          colSpan={colCount}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={() =>
              setExpandedGroups(prev => ({ ...prev, [key]: !isExpanded }))
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-small)',
              fontWeight: 600,
              color: 'var(--color-text)',
            }}
          >
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                display: 'inline-block',
                transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: `transform var(--motion-speed-fast) var(--motion-easing)`,
              }}
            >
              ▼
            </span>
            <span style={{ textTransform: 'capitalize' }}>{label}</span>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                backgroundColor: 'var(--color-surface)',
                padding: `2px var(--space-2)`,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
              }}
            >
              {groupRows.length}
            </span>
          </button>
        </td>
      </tr>,
      ...(isExpanded ? groupRows.map((row, rowIdx) => renderItemRow(row, rowIdx)) : []),
    ]
  })
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface InventoryTableProps {
  items: Item[]
  isAdmin: boolean
  groupBy?: GroupBy
  onApplyTitle: (itemId: string, title: string) => Promise<void>
  onApplyCategory: (itemId: string, category: string) => Promise<void>
  onApplyDescription: (itemId: string, draft: string) => Promise<void>
  onApplyTags: (itemId: string, tags: string[]) => Promise<void>
  onApplyPrice: (itemId: string, low: number, high: number) => Promise<void>
  onBulkDelete?: (itemIds: string[]) => Promise<void>
  onBulkRestore?: (itemIds: string[]) => Promise<void>
  showRestoreAction?: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InventoryTable({
  items,
  isAdmin,
  groupBy = 'none',
  onApplyTitle,
  onApplyCategory,
  onApplyDescription,
  onApplyTags,
  onApplyPrice,
  onBulkDelete,
  onBulkRestore,
  showRestoreAction = false,
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
  // expandedGroups: undefined key → expanded (default); false → collapsed
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

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
  // Bulk CRUD — delete or restore selected rows
  // ---------------------------------------------------------------------------

  const handleBulkCrud = useCallback(async (
    fn: (ids: string[]) => Promise<void>,
    confirmMsg: string,
  ) => {
    const t = tableRef.current
    if (!t) return
    const ids = t.getSelectedRowModel().rows.map(r => r.original.id)
    if (!ids.length) return
    if (!window.confirm(confirmMsg)) return
    setBatchLoading(true)
    setBatchError(null)
    try {
      await fn(ids)
      t.resetRowSelection()
    } catch (err) {
      setBatchError(err instanceof Error ? err.message : 'Operation failed.')
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

      {/* ---- Selection Context Banner — sticky top-anchored, appears on row selection ---- */}
      {selectedCount > 0 && (
        <div
          role="toolbar"
          aria-label="Batch actions"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            padding: 'var(--space-2) var(--space-4)',
            marginBottom: 'var(--space-3)',
            backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, var(--color-bg))',
            border: '1px solid color-mix(in srgb, var(--color-primary) 35%, var(--color-border))',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {/* Left zone: count badge + label + dismiss */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 'var(--space-6)',
              height: 'var(--space-6)',
              padding: '0 var(--space-2)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              fontFamily: 'var(--font-body)',
              lineHeight: 1,
            }}>
              {selectedCount}
            </span>
            <span style={{
              fontSize: 'var(--text-small)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
            }}>
              item{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <button
              type="button"
              aria-label="Clear selection"
              onClick={() => table.resetRowSelection()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '28px',
                minWidth: '28px',
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-small)',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Right zone: grouped actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {/* AI enrichment group */}
            <button
              type="button"
              disabled={batchLoading}
              onClick={() => runBatchAi(['description'])}
              style={{
                minHeight: '44px',
                padding: '0 var(--space-4)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: 'var(--text-small)',
                fontFamily: 'var(--font-body)',
                cursor: batchLoading ? 'not-allowed' : 'pointer',
                opacity: batchLoading ? 0.6 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              ✨ Descriptions
            </button>
            <button
              type="button"
              disabled={batchLoading}
              onClick={() => runBatchAi(['price'])}
              style={{
                minHeight: '44px',
                padding: '0 var(--space-4)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: 'var(--text-small)',
                fontFamily: 'var(--font-body)',
                cursor: batchLoading ? 'not-allowed' : 'pointer',
                opacity: batchLoading ? 0.6 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              $ Prices
            </button>

            {/* Divider between AI group and CRUD group */}
            <span
              aria-hidden="true"
              style={{
                width: '1px',
                alignSelf: 'stretch',
                minHeight: '24px',
                backgroundColor: 'var(--color-border)',
                flexShrink: 0,
              }}
            />

            {/* CRUD group */}
            {showRestoreAction && onBulkRestore && (
              <button
                type="button"
                disabled={batchLoading}
                onClick={() => handleBulkCrud(
                  onBulkRestore,
                  `Restore ${selectedCount} item${selectedCount !== 1 ? 's' : ''} to Draft?`,
                )}
                style={{
                  minHeight: '44px',
                  padding: '0 var(--space-4)',
                  border: '1px solid var(--color-primary)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-primary)',
                  fontSize: 'var(--text-small)',
                  fontFamily: 'var(--font-body)',
                  cursor: batchLoading ? 'not-allowed' : 'pointer',
                  opacity: batchLoading ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                Restore
              </button>
            )}
            {!showRestoreAction && onBulkDelete && (
              <button
                type="button"
                disabled={batchLoading}
                onClick={() => handleBulkCrud(
                  onBulkDelete,
                  `Move ${selectedCount} item${selectedCount !== 1 ? 's' : ''} to the Recycle Bin?`,
                )}
                style={{
                  minHeight: '44px',
                  padding: '0 var(--space-4)',
                  border: '1px solid var(--color-error)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-error)',
                  fontSize: 'var(--text-small)',
                  fontFamily: 'var(--font-body)',
                  cursor: batchLoading ? 'not-allowed' : 'pointer',
                  opacity: batchLoading ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Batch error band — dismissible, below the context banner */}
      {batchError && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-2) var(--space-4)',
            marginBottom: 'var(--space-3)',
            backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-error) 30%, var(--color-border))',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <span style={{ flex: 1, fontSize: 'var(--text-xs)', color: 'var(--color-error)', fontFamily: 'var(--font-body)' }}>
            {batchError}
          </span>
          <button
            type="button"
            onClick={() => setBatchError(null)}
            aria-label="Dismiss error"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-error)',
              fontSize: 'var(--text-small)',
              flexShrink: 0,
              minHeight: '28px',
              minWidth: '28px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
      )}

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
            {renderTableBody(
              table.getRowModel().rows,
              table.getVisibleLeafColumns().length,
              groupBy,
              expandedGroups,
              setExpandedGroups,
            )}
          </tbody>
        </table>
      </div>

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
