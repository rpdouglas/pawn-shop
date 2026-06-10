import { useState } from 'react'
import { Link } from 'react-router-dom'
import { doc, updateDoc, serverTimestamp, deleteField } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { formatPrice } from '../../lib/format'
import Badge from '../ui/Badge'
import QuantityAdjustControl from './QuantityAdjustControl'
import {
  TextCellEditor,
  SelectCellEditor,
  PriceCellEditor,
} from './InventoryTable/CellEditors'
import { STATUS_OPTIONS, CONDITION_OPTIONS } from './InventoryTable/CellEditorOptions'
import type { Item, ItemStatus, ConditionGrade } from '../../lib/types'

interface InventoryCardProps {
  item: Item
  onOpenDrawer: (item: Item) => void
}

type EditingField = 'title' | 'status' | 'condition' | 'price' | null

export default function InventoryCard({ item, onOpenDrawer }: InventoryCardProps) {
  const [editing, setEditing] = useState<EditingField>(null)

  const save = async (field: string, value: unknown) => {
    setEditing(null)
    try {
      await updateDoc(doc(db, 'items', item.id), { [field]: value })
    } catch {
      // Firestore security rules will reject invalid writes silently
    }
  }

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`Archive "${item.title}"?`)) return
    try {
      await updateDoc(doc(db, 'items', item.id), { status: 'archived' })
    } catch {
      // silent
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`Move "${item.title}" to Recycle Bin?`)) return
    try {
      await updateDoc(doc(db, 'items', item.id), { status: 'deleted', deletedAt: serverTimestamp() })
    } catch {
      // silent
    }
  }

  const handleRestore = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await updateDoc(doc(db, 'items', item.id), { status: 'draft', deletedAt: deleteField() })
    } catch {
      // silent
    }
  }

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        gap: 'var(--space-3)',
      }}
    >
      {/* Thumbnail + key fields */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
        <button
          type="button"
          aria-label={`Open AI assistant for ${item.title}`}
          onClick={() => onOpenDrawer(item)}
          style={{
            flexShrink: 0,
            width: '80px',
            height: '80px',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            backgroundColor: 'var(--color-bg)',
          }}
        >
          {item.images?.[0] ? (
            <img
              src={item.images[0]}
              alt=""
              aria-hidden="true"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-bg)' }}
              aria-hidden="true"
            />
          )}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Inline title */}
          {editing === 'title' ? (
            <TextCellEditor
              initialValue={item.title}
              onSave={v => save('title', v)}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <button
              type="button"
              title="Click to edit title"
              onClick={() => setEditing('title')}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '0 0 var(--space-2)',
                cursor: 'text',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-small)',
                fontWeight: 500,
                color: 'var(--color-text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.title}
            </button>
          )}

          {/* Status + Condition row */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
            {editing === 'status' ? (
              <SelectCellEditor<ItemStatus>
                initialValue={item.status}
                options={STATUS_OPTIONS}
                onSave={v => save('status', v)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <button
                type="button"
                title="Click to edit status"
                onClick={() => setEditing('status')}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <Badge variant={item.status} label={item.status} />
              </button>
            )}

            {editing === 'condition' ? (
              <SelectCellEditor<ConditionGrade>
                initialValue={item.condition}
                options={CONDITION_OPTIONS}
                onSave={v => save('condition', v)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <button
                type="button"
                title="Click to edit condition"
                onClick={() => setEditing('condition')}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <Badge
                  variant={`condition-${item.condition}`}
                  label={item.condition || 'no condition'}
                />
              </button>
            )}

            {item.policeHold && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', fontWeight: 'bold' }}>
                HOLD
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Price */}
      <div>
        {editing === 'price' ? (
          <PriceCellEditor
            initialCents={item.price ?? 0}
            onSave={v => save('price', v)}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <button
            type="button"
            title="Click to edit price"
            onClick={() => setEditing('price')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'text',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-md)',
              fontWeight: 600,
              color: item.originalPrice ? 'var(--color-primary)' : 'var(--color-text)',
            }}
          >
            {formatPrice(item.price ?? 0)}
            {item.originalPrice && (
              <span style={{
                fontSize: 'var(--text-xs)',
                textDecoration: 'line-through',
                color: 'var(--color-text-muted)',
                fontWeight: 400,
              }}>
                {formatPrice(item.originalPrice)}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Quantity adjust */}
      {item.quantity !== undefined && (
        <div onClick={e => e.stopPropagation()}>
          <QuantityAdjustControl itemId={item.id} quantity={item.quantity} compact />
        </div>
      )}

      {/* Actions — ≥48px touch targets */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'auto' }}>
        <Link
          to={`/admin/mobile-intake/edit/${item.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '48px',
            padding: '0 var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-small)',
            textDecoration: 'none',
          }}
        >
          Full Edit
        </Link>
        {item.status === 'deleted' ? (
          <button
            type="button"
            onClick={handleRestore}
            style={{
              minHeight: '48px',
              padding: '0 var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-primary)',
              backgroundColor: 'transparent',
              color: 'var(--color-primary)',
              fontSize: 'var(--text-small)',
              cursor: 'pointer',
            }}
          >
            Restore
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleArchive}
              style={{
                minHeight: '48px',
                padding: '0 var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'transparent',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-small)',
                cursor: 'pointer',
              }}
            >
              Archive
            </button>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                minHeight: '48px',
                padding: '0 var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-error)',
                backgroundColor: 'transparent',
                color: 'var(--color-error)',
                fontSize: 'var(--text-small)',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </article>
  )
}
