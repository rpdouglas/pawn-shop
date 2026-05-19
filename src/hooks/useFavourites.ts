import { useState, useEffect } from 'react'
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

export interface Favourite {
  itemId: string
  createdAt: Timestamp | null
}

export function useFavourites() {
  const { user } = useAuth()
  const [favourites, setFavourites] = useState<Favourite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      Promise.resolve().then(() => {
        if (favourites.length > 0) setFavourites([])
        if (loading) setLoading(false)
      })
      return
    }

    const q = query(
      collection(db, `users/${user.uid}/favourites`),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({
        itemId: doc.id,
        ...doc.data()
      })) as Favourite[]
      setFavourites(data)
      setLoading(false)
    }, (err) => {
      console.error('Error fetching favourites:', err)
      setLoading(false)
    })

    return unsubscribe
  }, [user, favourites.length, loading])

  const isFavourite = (itemId: string) => {
    return favourites.some(f => f.itemId === itemId)
  }

  const toggleFavourite = async (itemId: string) => {
    if (!user) throw new Error('Sign in required')
    
    const ref = doc(db, `users/${user.uid}/favourites`, itemId)
    
    if (isFavourite(itemId)) {
      await deleteDoc(ref)
    } else {
      await setDoc(ref, {
        itemId,
        createdAt: serverTimestamp()
      })
    }
  }

  return { favourites, loading, isFavourite, toggleFavourite }
}
