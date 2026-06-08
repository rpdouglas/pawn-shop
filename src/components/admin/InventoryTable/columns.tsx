import type { ColumnDef, RowData } from '@tanstack/react-table'
import type { Item, ItemStatus, ConditionGrade, ViewType } from '../../../lib/types'
import { formatPrice, formatDate } from '../../../lib/format'
import Badge from '../../ui/Badge'
import QuantityAdjustControl from '../QuantityAdjustControl'
import {
  TextCellEditor,
  SelectCellEditor,
  PriceCellEditor,
  TagCellEditor,
  PoliceHoldCell,
} from './CellEditors'
import { STATUS_OPTIONS, CONDITION_OPTIONS, VIEW_TAG_OPTIONS } from './CellEditorOptions'

// ---------------------------------------------------------------------------
// Table meta interface — accessed via info.table.options.meta
// ---------------------------------------------------------------------------

export interface EditingCell {
  rowId: string
  colId: string
}

export type AiOpStatus = 'loading' | 'done' | 'error'
export type NavDirection = 'tab' | 'shift-tab'

export interface InventoryTableMeta {
  editingCell: EditingCell | null
  setEditingCell: (cell: EditingCell | null) => void
  onCellSave: (rowId: string, field: string, value: unknown) => Promise<void>
  onNavigate: (rowId: string, colId: string, direction: NavDirection) => void
  isAdmin: boolean
  onOpenDrawer: (item: Item) => void
  copyValue: (value: string) => void
  triggerAi: (item: Item, op: 'description' | 'price') => void
  aiStatus: Record<string, AiOpStatus>
}

// Augment TanStack Table to type .meta correctly
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    editingCell: EditingCell | null
    setEditingCell: (cell: EditingCell | null) => void
    onCellSave: (rowId: string, field: string, value: unknown) => Promise<void>
    onNavigate: (rowId: string, colId: string, direction: NavDirection) => void
    isAdmin: boolean
    onOpenDrawer: (item: Item) => void
    copyValue: (value: string) => void
    triggerAi: (item: Item, op: 'description' | 'price') => void
    aiStatus: Record<string, AiOpStatus>
  }
}

// Editable column IDs — used by navigation handler to skip non-editable columns
export const EDITABLE_COLUMN_IDS = ['title', 'status', 'condition', 'price', 'category', 'viewTag', 'serialNumber', 'merchandisingTags']

// ---------------------------------------------------------------------------
// Shared cell wrapper — applies focus styling and keyboard handlers
// ---------------------------------------------------------------------------

interface CellWrapperProps {
  rowId: string
  colId: string
  displayValue: string
  isEditable: boolean
  meta: InventoryTableMeta
  children: React.ReactNode
  minWidth?: string
}

// eslint-disable-next-line react-refresh/only-export-components
function CellWrapper({ rowId, colId, displayValue, isEditable, meta, children, minWidth }: CellWrapperProps) {
  const isEditing = meta.editingCell?.rowId === rowId && meta.editingCell?.colId === colId

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isEditable || isEditing) return
    if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      meta.copyValue(displayValue)
    } else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then(v => {
        if (v) meta.setEditingCell({ rowId, colId })
        // The editor will receive initialValue = displayValue; user can then paste
        // natively inside the focused input. For richer paste, CellEditors accept
        // an optional pasteValue prop — deferred to a future iteration.
      }).catch(() => {
        meta.setEditingCell({ rowId, colId })
      })
    } else if (e.key === 'Enter' && !isEditing) {
      e.preventDefault()
      meta.setEditingCell({ rowId, colId })
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && !isEditing) {
      // Printable character starts edit mode
      meta.setEditingCell({ rowId, colId })
    }
  }

  return (
    <div
      tabIndex={isEditable && !isEditing ? 0 : -1}
      role="gridcell"
      onClick={() => isEditable && meta.setEditingCell({ rowId, colId })}
      onKeyDown={handleKeyDown}
      style={{
        position: 'relative',
        minWidth,
        outline: 'none',
        cursor: isEditable ? 'text' : 'default',
        padding: isEditing ? 0 : 'var(--space-1) var(--space-2)',
        borderRadius: 'var(--radius-sm)',
        // Focused ring (browser :focus-visible handles this, but we add a subtle bg)
        transition: `background-color var(--motion-speed-fast) var(--motion-easing)`,
      }}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

export function buildColumns(): ColumnDef<Item, unknown>[] {
  return [
    // --- Select (checkbox) ---
    {
      id: 'select',
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <input
          type="checkbox"
          aria-label="Select all rows"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select ${row.original.title}`}
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
        />
      ),
    },

    // --- Image ---
    {
      id: 'image',
      enableSorting: false,
      enableHiding: false,
      header: () => null,
      cell: ({ row, table }) => {
        const item = row.original
        const src = item.images?.[0]
        return (
          <button
            type="button"
            aria-label={`Open AI drawer for ${item.title}`}
            onClick={() => table.options.meta?.onOpenDrawer(item)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'block',
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {src ? (
              <img
                src={src}
                alt=""
                aria-hidden="true"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-bg)' }} />
            )}
          </button>
        )
      },
    },

    // --- Title ---
    {
      id: 'title',
      accessorKey: 'title',
      header: 'Title',
      enableSorting: true,
      cell: ({ row, table }) => {
        const meta = table.options.meta!
        const item = row.original
        const isEditing = meta.editingCell?.rowId === row.id && meta.editingCell?.colId === 'title'
        return (
          <CellWrapper rowId={row.id} colId="title" displayValue={item.title} isEditable meta={meta} minWidth="180px">
            {isEditing ? (
              <TextCellEditor
                initialValue={item.title}
                onSave={v => { meta.onCellSave(row.id, 'title', v); meta.setEditingCell(null) }}
                onCancel={() => meta.setEditingCell(null)}
                onTabForward={() => meta.onNavigate(row.id, 'title', 'tab')}
                onTabBack={() => meta.onNavigate(row.id, 'title', 'shift-tab')}
              />
            ) : (
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-small)',
                color: 'var(--color-text)',
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '280px',
              }}>
                {item.title}
              </span>
            )}
          </CellWrapper>
        )
      },
    },

    // --- Status ---
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({ row, table }) => {
        const meta = table.options.meta!
        const item = row.original
        const isEditing = meta.editingCell?.rowId === row.id && meta.editingCell?.colId === 'status'
        return (
          <CellWrapper rowId={row.id} colId="status" displayValue={item.status} isEditable meta={meta} minWidth="110px">
            {isEditing ? (
              <SelectCellEditor<ItemStatus>
                initialValue={item.status}
                options={STATUS_OPTIONS}
                onSave={v => { meta.onCellSave(row.id, 'status', v); meta.setEditingCell(null) }}
                onCancel={() => meta.setEditingCell(null)}
                onTabForward={() => meta.onNavigate(row.id, 'status', 'tab')}
                onTabBack={() => meta.onNavigate(row.id, 'status', 'shift-tab')}
              />
            ) : (
              <Badge variant={item.status} label={item.status} />
            )}
          </CellWrapper>
        )
      },
    },

    // --- Condition ---
    {
      id: 'condition',
      accessorKey: 'condition',
      header: 'Condition',
      enableSorting: true,
      cell: ({ row, table }) => {
        const meta = table.options.meta!
        const item = row.original
        const isEditing = meta.editingCell?.rowId === row.id && meta.editingCell?.colId === 'condition'
        return (
          <CellWrapper rowId={row.id} colId="condition" displayValue={item.condition} isEditable meta={meta} minWidth="110px">
            {isEditing ? (
              <SelectCellEditor<ConditionGrade>
                initialValue={item.condition}
                options={CONDITION_OPTIONS}
                onSave={v => { meta.onCellSave(row.id, 'condition', v); meta.setEditingCell(null) }}
                onCancel={() => meta.setEditingCell(null)}
                onTabForward={() => meta.onNavigate(row.id, 'condition', 'tab')}
                onTabBack={() => meta.onNavigate(row.id, 'condition', 'shift-tab')}
              />
            ) : (
              <Badge variant={`condition-${item.condition}`} label={item.condition} />
            )}
          </CellWrapper>
        )
      },
    },

    // --- Price ---
    {
      id: 'price',
      accessorKey: 'price',
      header: 'Price (CAD)',
      enableSorting: true,
      cell: ({ row, table }) => {
        const meta = table.options.meta!
        const item = row.original
        const isEditing = meta.editingCell?.rowId === row.id && meta.editingCell?.colId === 'price'
        const displayValue = formatPrice(item.price)
        return (
          <CellWrapper rowId={row.id} colId="price" displayValue={displayValue} isEditable meta={meta} minWidth="100px">
            {isEditing ? (
              <PriceCellEditor
                initialCents={item.price}
                onSave={v => { meta.onCellSave(row.id, 'price', v); meta.setEditingCell(null) }}
                onCancel={() => meta.setEditingCell(null)}
                onTabForward={() => meta.onNavigate(row.id, 'price', 'tab')}
                onTabBack={() => meta.onNavigate(row.id, 'price', 'shift-tab')}
              />
            ) : (
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-small)',
                color: item.originalPrice ? 'var(--color-primary)' : 'var(--color-text)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                {displayValue}
                {item.originalPrice && (
                  <span style={{ marginLeft: 'var(--space-1)', fontSize: 'var(--text-xs)', textDecoration: 'line-through', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                    {formatPrice(item.originalPrice)}
                  </span>
                )}
              </span>
            )}
          </CellWrapper>
        )
      },
    },

    // --- Quantity ---
    {
      id: 'quantity',
      accessorKey: 'quantity',
      header: 'Qty',
      enableSorting: true,
      cell: ({ row }) => {
        const item = row.original
        if (item.quantity === undefined) {
          return <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>—</span>
        }
        return (
          <div onClick={e => e.stopPropagation()}>
            <QuantityAdjustControl itemId={item.id} quantity={item.quantity} compact />
          </div>
        )
      },
    },

    // --- Category (hidden by default) ---
    {
      id: 'category',
      accessorKey: 'category',
      header: 'Category',
      enableSorting: true,
      cell: ({ row, table }) => {
        const meta = table.options.meta!
        const item = row.original
        const isEditing = meta.editingCell?.rowId === row.id && meta.editingCell?.colId === 'category'
        return (
          <CellWrapper rowId={row.id} colId="category" displayValue={item.category} isEditable meta={meta} minWidth="120px">
            {isEditing ? (
              <TextCellEditor
                initialValue={item.category}
                onSave={v => { meta.onCellSave(row.id, 'category', v); meta.setEditingCell(null) }}
                onCancel={() => meta.setEditingCell(null)}
                onTabForward={() => meta.onNavigate(row.id, 'category', 'tab')}
                onTabBack={() => meta.onNavigate(row.id, 'category', 'shift-tab')}
              />
            ) : (
              <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text)', textTransform: 'capitalize' }}>
                {item.category || '—'}
              </span>
            )}
          </CellWrapper>
        )
      },
    },

    // --- ViewTag (hidden by default) ---
    {
      id: 'viewTag',
      accessorKey: 'viewTag',
      header: 'View',
      enableSorting: true,
      cell: ({ row, table }) => {
        const meta = table.options.meta!
        const item = row.original
        const isEditing = meta.editingCell?.rowId === row.id && meta.editingCell?.colId === 'viewTag'
        return (
          <CellWrapper rowId={row.id} colId="viewTag" displayValue={item.viewTag} isEditable meta={meta} minWidth="100px">
            {isEditing ? (
              <SelectCellEditor<ViewType>
                initialValue={item.viewTag}
                options={VIEW_TAG_OPTIONS}
                onSave={v => { meta.onCellSave(row.id, 'viewTag', v); meta.setEditingCell(null) }}
                onCancel={() => meta.setEditingCell(null)}
                onTabForward={() => meta.onNavigate(row.id, 'viewTag', 'tab')}
                onTabBack={() => meta.onNavigate(row.id, 'viewTag', 'shift-tab')}
              />
            ) : (
              <span style={{
                fontSize: 'var(--text-xs)',
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-muted)',
                textTransform: 'capitalize',
              }}>
                {item.viewTag}
              </span>
            )}
          </CellWrapper>
        )
      },
    },

    // --- Serial Number (hidden by default) ---
    {
      id: 'serialNumber',
      accessorKey: 'serialNumber',
      header: 'Serial #',
      enableSorting: false,
      cell: ({ row, table }) => {
        const meta = table.options.meta!
        const item = row.original
        const isEditing = meta.editingCell?.rowId === row.id && meta.editingCell?.colId === 'serialNumber'
        const display = item.serialNumber ?? '—'
        return (
          <CellWrapper rowId={row.id} colId="serialNumber" displayValue={display} isEditable meta={meta} minWidth="120px">
            {isEditing ? (
              <TextCellEditor
                initialValue={item.serialNumber ?? ''}
                onSave={v => { meta.onCellSave(row.id, 'serialNumber', v || null); meta.setEditingCell(null) }}
                onCancel={() => meta.setEditingCell(null)}
                onTabForward={() => meta.onNavigate(row.id, 'serialNumber', 'tab')}
                onTabBack={() => meta.onNavigate(row.id, 'serialNumber', 'shift-tab')}
              />
            ) : (
              <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                {display}
              </span>
            )}
          </CellWrapper>
        )
      },
    },

    // --- Police Hold (hidden by default, admin-only edit) ---
    {
      id: 'policeHold',
      accessorKey: 'policeHold',
      header: 'Police Hold',
      enableSorting: false,
      cell: ({ row, table }) => {
        const meta = table.options.meta!
        const item = row.original
        return (
          <div style={{ padding: 'var(--space-1)' }}>
            <PoliceHoldCell
              value={item.policeHold ?? false}
              isAdmin={meta.isAdmin}
              onSave={v => meta.onCellSave(row.id, 'policeHold', v)}
            />
          </div>
        )
      },
    },

    // --- Merchandising Tags (hidden by default) ---
    {
      id: 'merchandisingTags',
      accessorKey: 'merchandisingTags',
      header: 'Tags',
      enableSorting: false,
      cell: ({ row, table }) => {
        const meta = table.options.meta!
        const item = row.original
        const isEditing = meta.editingCell?.rowId === row.id && meta.editingCell?.colId === 'merchandisingTags'
        const tags = item.merchandisingTags ?? []
        return (
          <CellWrapper rowId={row.id} colId="merchandisingTags" displayValue={tags.join(', ')} isEditable meta={meta} minWidth="140px">
            {isEditing ? (
              <TagCellEditor
                initialTags={tags}
                isAdmin={meta.isAdmin}
                onSave={v => { meta.onCellSave(row.id, 'merchandisingTags', v); meta.setEditingCell(null) }}
                onCancel={() => meta.setEditingCell(null)}
              />
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                {tags.length === 0 ? (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>—</span>
                ) : (
                  tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 'var(--text-xs)',
                        padding: 'var(--space-1) var(--space-2)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-muted)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tag}
                    </span>
                  ))
                )}
              </div>
            )}
          </CellWrapper>
        )
      },
    },

    // --- eBay Listing ID (hidden by default, read-only) ---
    {
      id: 'ebayListingId',
      accessorKey: 'ebayListingId',
      header: 'eBay ID',
      enableSorting: false,
      cell: ({ row }) => {
        const id = row.original.ebayListingId
        return (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
            {id ?? '—'}
          </span>
        )
      },
    },

    // --- POS Sync Status (hidden by default, read-only) ---
    {
      id: 'posSyncStatus',
      accessorKey: 'posSyncStatus',
      header: 'POS Sync',
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.original.posSyncStatus
        return (
          <span style={{
            fontSize: 'var(--text-xs)',
            color: status === 'error' ? 'var(--color-error)' : 'var(--color-text-muted)',
            textTransform: 'capitalize',
          }}>
            {status ?? '—'}
          </span>
        )
      },
    },

    // --- Created At (hidden by default, read-only) ---
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Created',
      enableSorting: true,
      cell: ({ row }) => {
        const d = row.original.createdAt
        return (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {d ? formatDate(d) : '—'}
          </span>
        )
      },
    },

    // --- Trending Score (hidden by default, read-only) ---
    {
      id: 'trendingScore',
      accessorKey: 'trendingScore',
      header: 'Trending',
      enableSorting: true,
      cell: ({ row }) => (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {row.original.trendingScore?.toFixed(2) ?? '—'}
        </span>
      ),
    },

    // --- AI actions ---
    {
      id: 'ai',
      enableSorting: false,
      enableHiding: false,
      header: () => <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>AI</span>,
      cell: ({ row, table }) => {
        const meta = table.options.meta!
        const item = row.original
        const status = meta.aiStatus[item.id]
        return (
          <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
            {status === 'loading' ? (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>…</span>
            ) : status === 'done' ? (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success, #4caf50)' }}>✓</span>
            ) : status === 'error' ? (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>✗</span>
            ) : null}
            <button
              type="button"
              aria-label={`Generate AI description for ${item.title}`}
              onClick={e => { e.stopPropagation(); meta.triggerAi(item, 'description') }}
              style={{
                minHeight: '32px',
                minWidth: '32px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
              }}
              title="Generate description"
            >
              ✨
            </button>
            <button
              type="button"
              aria-label={`Suggest AI price for ${item.title}`}
              onClick={e => { e.stopPropagation(); meta.triggerAi(item, 'price') }}
              style={{
                minHeight: '32px',
                minWidth: '32px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
              }}
              title="Suggest price"
            >
              $
            </button>
          </div>
        )
      },
    },
  ]
}

// Columns hidden by default (visible only via column visibility panel)
export const DEFAULT_HIDDEN_COLUMNS: Record<string, boolean> = {
  category: false,
  viewTag: false,
  serialNumber: false,
  policeHold: false,
  merchandisingTags: false,
  ebayListingId: false,
  posSyncStatus: false,
  createdAt: false,
  trendingScore: false,
}
