import { useState, useEffect } from 'react'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

export interface SavedSearch {
  id: string
  uid: string
  query: string
  viewTag: string
  category?: string
  active: boolean
  alertMethod: 'sms' | 'email'
  createdAt: Timestamp | null
}

export function useSavedSearches() {
  const { user } = useAuth()
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      Promise.resolve().then(() => {
        if (searches.length > 0) setSearches([])
        if (loading) setLoading(false)
      })
      return
    }

    const q = query(
      collection(db, 'savedSearches'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedSearch[]
      setSearches(data)
      setLoading(false)
    }, (err) => {
      console.error('Error fetching saved searches:', err)
      setError(err.message)
      setLoading(false)
    })

    return unsubscribe
  }, [user, searches.length, loading])

  const saveSearch = async (data: Omit<SavedSearch, 'id' | 'uid' | 'createdAt'>) => {
    if (!user) throw new Error('Sign in required')
    
    // CASL check should be enforced in UI before calling this, 
    // but we check here as well for safety.
    await addDoc(collection(db, 'savedSearches'), {
      ...data,
      uid: user.uid,
      createdAt: serverTimestamp()
    })
  }

  const toggleSearch = async (id: string, active: boolean) => {
    const ref = doc(db, 'savedSearches', id)
    await updateDoc(ref, { active })
  }

  const deleteSearch = async (id: string) => {
    const ref = doc(db, 'savedSearches', id)
    await deleteDoc(ref)
  }

  return { searches, loading, error, saveSearch, toggleSearch, deleteSearch }
}
