import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { useFavourites } from '../hooks/useFavourites'
import { docToItem } from '../hooks/useItems'
import MasonryGrid from '../components/pawn/MasonryGrid'
import ItemQuickView from '../components/pawn/ItemQuickView'
import ClickCollectModal from '../components/pawn/ClickCollectModal'
import type { Item } from '../lib/types'
import { useFeatureFlags } from '../lib/featureFlags'

export default function FavouritesPage() {
  const { user } = useAuth()
  const { favourites, loading: favsLoading } = useFavourites()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [collectItem, setCollectItem] = useState<Item | null>(null)
  const { showRelatedItems } = useFeatureFlags()

  useEffect(() => {
    if (favsLoading) return

    const fetchItems = async () => {
      setLoading(true)
      try {
        const itemPromises = favourites.map(f => getDoc(doc(db, 'items', f.itemId)))
        const snaps = await Promise.all(itemPromises)
        const fetchedItems = snaps
          .filter(snap => snap.exists())
          .map(snap => docToItem(snap))
        setItems(fetchedItems)
      } catch (err) {
        console.error('Error fetching favourited items:', err)
      } finally {
        setLoading(false)
      }
    }

    if (favourites.length > 0) {
      fetchItems()
    } else {
      Promise.resolve().then(() => {
        if (items.length > 0) setItems([])
        if (loading) setLoading(false)
      })
    }
  }, [favourites, favsLoading, items.length, loading])

  if (!user) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-12) var(--space-6)', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>Sign in to view favourites</h2>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      <header style={{ marginBottom: 'var(--space-12)' }}>
        <h1 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 'var(--text-heading)', 
          color: 'var(--color-text)',
          margin: 0
        }}>
          Your Favourites
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
          Items you've saved for later.
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading your favourites...</p>
        </div>
      ) : items.length > 0 ? (
        <MasonryGrid
          items={items}
          loading={false}
          hasMore={false}
          onLoadMore={() => {}}
          onItemSelect={setSelectedItem}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
            You haven't added any favourites yet.
          </p>
        </div>
      )}

      {selectedItem && (
        <ItemQuickView
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onCollect={() => {
            setCollectItem(selectedItem)
            setSelectedItem(null)
          }}
          onSelectRelated={showRelatedItems ? setSelectedItem : undefined}
        />
      )}

      {collectItem && (
        <ClickCollectModal
          item={collectItem}
          onClose={() => setCollectItem(null)}
        />
      )}
    </div>
  )
}
