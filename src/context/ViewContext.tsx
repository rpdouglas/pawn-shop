import { createContext, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { ViewType } from '../lib/types'

interface ViewContextValue {
  view: ViewType
}

const ViewContext = createContext<ViewContextValue>({ view: 'pawn' })

function deriveView(pathname: string): ViewType {
  if (pathname.startsWith('/cannabis')) return 'cannabis'
  if (pathname.startsWith('/fireworks')) return 'fireworks'
  return 'pawn'
}

export function ViewProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const view = deriveView(pathname)
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
