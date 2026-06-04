import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { docToItem } from './useItems'
import type { Item, ViewType } from '../lib/types'

const BATCH_SIZE = 20

export function useItemSearch(viewTag: ViewType): {
  items: Item[]
  loading: boolean
  error: string | null
  hasMore: boolean
  searchValue: string
  setSearchValue: (v: string) => void
  loadMore: () => void
} {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [limit, setLimit] = useState(BATCH_SIZE)

  // Debounce: reset limit when search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue.trim().toLowerCase())
      setLimit(BATCH_SIZE)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue])

  // Firestore subscription — switches query when search is active
  useEffect(() => {
    const baseConstraints = [
      where('viewTag', '==', viewTag),
      where('status', '==', 'active'),
      where('policeHold', '==', false),
    ]

    const q = debouncedSearch
      ? query(
          collection(db, 'items'),
          ...baseConstraints,
          where('searchTokens', 'array-contains', debouncedSearch),
          firestoreLimit(limit),
        )
      : query(
          collection(db, 'items'),
          ...baseConstraints,
          orderBy('createdAt', 'desc'),
          firestoreLimit(limit),
        )

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map(docToItem))
        setHasMore(snap.docs.length === limit)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [viewTag, debouncedSearch, limit])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setLoading(true)
      setLimit((prev) => prev + BATCH_SIZE)
    }
  }, [loading, hasMore])

  return { items, loading, error, hasMore, searchValue, setSearchValue, loadMore }
}
