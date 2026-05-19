import { useState, useEffect } from 'react'
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

export interface AppNotification {
  id: string
  title: string
  body: string
  link?: string
  read: boolean
  createdAt: Timestamp | null
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      Promise.resolve().then(() => {
        if (notifications.length > 0) setNotifications([])
        if (loading) setLoading(false)
      })
      return
    }

    const q = query(
      collection(db, `users/${user.uid}/notifications`),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppNotification[]
      setNotifications(data)
      setLoading(false)
    }, (err) => {
      console.error('Error fetching notifications:', err)
      setLoading(false)
    })

    return unsubscribe
  }, [user, notifications.length, loading])

  const markAsRead = async (id: string) => {
    if (!user) return
    const ref = doc(db, `users/${user.uid}/notifications`, id)
    await updateDoc(ref, { read: true })
  }

  const deleteNotification = async (id: string) => {
    if (!user) return
    const ref = doc(db, `users/${user.uid}/notifications`, id)
    await deleteDoc(ref)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, loading, markAsRead, deleteNotification, unreadCount }
}
