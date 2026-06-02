import { createContext, useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { ReactNode } from 'react'
import type { ViewType } from '../lib/types'

interface ViewContextValue {
  view: ViewType
}

// eslint-disable-next-line react-refresh/only-export-components
export const ViewContext = createContext<ViewContextValue>({ view: 'pawn' })

function deriveView(pathname: string): ViewType {
  if (pathname.startsWith('/cannabis')) return 'cannabis'
  if (pathname.startsWith('/fireworks')) return 'fireworks'
  return 'pawn'
}

export function ViewProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const view = deriveView(pathname)

  useEffect(() => {
    // E15: Cross-view browsing detection
    const sessionViewsStr = sessionStorage.getItem('pawn_shop_session_views') || ''
    const sessionViews = new Set(sessionViewsStr ? sessionViewsStr.split(',') : [])
    
    if (!sessionViews.has(view)) {
      sessionViews.add(view)
      sessionStorage.setItem('pawn_shop_session_views', Array.from(sessionViews).join(','))
    }

    if (sessionViews.size > 1 && user?.uid) {
      const uid = user.uid
      Promise.all([
        import('../lib/firebase').then(m => m.db),
        import('firebase/firestore'),
      ]).then(([db, { doc, updateDoc }]) => {
        updateDoc(doc(db, 'users', uid), { crossViewFlag: true }).catch(err => {
          console.debug('Failed to update crossViewFlag:', err.message)
        })
      })
    }
  }, [view, user])

  return (
    <ViewContext.Provider value={{ view }}>
      {children}
    </ViewContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useView(): ViewContextValue {
  return useContext(ViewContext)
}
