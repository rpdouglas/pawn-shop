import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  type DocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Item, ViewType, ConditionGrade, ItemStatus, MerchandisingTag, PosSyncStatus, CannabisProfile, FireworksProfile } from '../lib/types'

export function docToItem(doc: DocumentSnapshot): Item {
  const d = doc.data() ?? {}
  return {
    id: doc.id,
    title: String(d['title'] ?? ''),
    description: String(d['description'] ?? ''),
    category: String(d['category'] ?? ''),
    viewTag: d['viewTag'] as ViewType,
    viewTags: d['viewTags'] as ViewType[] | undefined,
    status: d['status'] as ItemStatus,
    price: Number(d['price'] ?? 0),
    condition: d['condition'] as ConditionGrade,
    images: (d['images'] as string[]) ?? [],
    videoUrl: d['videoUrl'] as string | undefined,
    searchTokens: (d['searchTokens'] as string[]) ?? [],
    serialNumber: d['serialNumber'] as string | undefined,
    serialBlacklistFlag: d['serialBlacklistFlag'] as boolean | undefined,
    policeHold: d['policeHold'] as boolean | undefined,
    holdExpiresAt: (d['holdExpiresAt'] as Timestamp | undefined)?.toDate(),
    locationId: d['locationId'] as string | undefined,
    isSeasonalItem: d['isSeasonalItem'] as boolean | undefined,
    bundleIds: d['bundleIds'] as string[] | undefined,
    merchandisingTags: d['merchandisingTags'] as MerchandisingTag[] | undefined,
    provenanceNotes: d['provenanceNotes'] as string | undefined,
    trendingScore: d['trendingScore'] as number | undefined,
    viewCount: d['viewCount'] as number | undefined,
    enquiryCount: d['enquiryCount'] as number | undefined,
    staffPickNote: d['staffPickNote'] as string | undefined,
    ebayListingId: d['ebayListingId'] as string | undefined,
    createdAt: (d['createdAt'] as Timestamp | undefined)?.toDate(),
    updatedAt: (d['updatedAt'] as Timestamp | undefined)?.toDate(),
    deletedAt: (d['deletedAt'] as Timestamp | undefined)?.toDate(),
    publishedBy: d['publishedBy'] as string | undefined,
    quantity: d['quantity'] as number | undefined,
    posId: d['posId'] as string | undefined,
    posSyncStatus: d['posSyncStatus'] as PosSyncStatus | undefined,
    posLastSyncAt: (d['posLastSyncAt'] as Timestamp | undefined)?.toDate(),
    cannabisProfile: d['cannabisProfile'] as CannabisProfile | undefined,
    fireworksProfile: d['fireworksProfile'] as FireworksProfile | undefined,
  }
}

interface UseItemsOptions {
  limit?: number
  orderByField?: 'createdAt' | 'trendingScore'
}

export function useItems(
  viewTag: ViewType,
  options?: UseItemsOptions,
): { items: Item[]; loading: boolean; error: string | null } {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const itemLimit = options?.limit ?? 20
  const orderField = options?.orderByField ?? 'createdAt'

  useEffect(() => {
    const q = query(
      collection(db, 'items'),
      where('viewTag', '==', viewTag),
      where('status', '==', 'active'),
      where('policeHold', '==', false),
      orderBy(orderField, 'desc'),
      firestoreLimit(itemLimit),
    )

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map(docToItem))
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [viewTag, itemLimit, orderField])

  return { items, loading, error }
}
