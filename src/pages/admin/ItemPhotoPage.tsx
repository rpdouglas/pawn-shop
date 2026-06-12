import { useState, useEffect, useRef } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { useParams } from 'react-router-dom'
import { db } from '../../lib/firebase'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import ImageUploadZone from '../../components/admin/ImageUploadZone'

export default function ItemPhotoPage() {
  const { itemId } = useParams<{ itemId: string }>()
  const [images, setImages] = useState<string[]>([])
  const [itemTitle, setItemTitle] = useState('')
  const [viewTag, setViewTag] = useState('')
  const [photoAdded, setPhotoAdded] = useState(false)
  const initialCountRef = useRef<number | null>(null)

  useEffect(() => {
    if (!itemId) return
    const unsubscribe = onSnapshot(doc(db, 'items', itemId), (snap) => {
      if (!snap.exists()) return
      const data = snap.data()
      const newImages: string[] = Array.isArray(data.images) ? data.images : []

      if (initialCountRef.current === null) {
        initialCountRef.current = newImages.length
      } else if (newImages.length > initialCountRef.current) {
        setPhotoAdded(true)
      }

      setImages(newImages)
      if (data.title) setItemTitle(data.title as string)
      if (data.viewTag) setViewTag(data.viewTag as string)
    })
    return () => unsubscribe()
  }, [itemId])

  return (
    <ProtectedRoute staffOnly>
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: 'var(--space-6)',
        paddingBottom: 'var(--space-24)',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          margin: '0 0 var(--space-2)',
        }}>Photo Upload</p>

        {itemTitle && (
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-heading)',
            color: 'var(--color-text)',
            margin: '0 0 var(--space-6)',
          }}>{itemTitle}</h1>
        )}

        {photoAdded ? (
          <div role="status" style={{
            padding: 'var(--space-6)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body)',
              color: 'var(--color-primary)',
              margin: '0 0 var(--space-2)',
              fontWeight: 500,
            }}>Photo saved</p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-small)',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}>You can close this tab.</p>
          </div>
        ) : (
          <ImageUploadZone
            itemId={itemId ?? null}
            images={images}
            extractData={false}
            viewTag={viewTag || undefined}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
