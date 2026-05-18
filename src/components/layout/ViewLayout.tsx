import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useView } from '../../context/ViewContext'
import GlobalHeader from './GlobalHeader'

const THEME_COLORS: Record<string, string> = {
  pawn:      '#C8A14A',
  cannabis:  '#7B4FA0',
  fireworks: '#C0392B',
}

interface ViewLayoutProps {
  children: ReactNode
}

export default function ViewLayout({ children }: ViewLayoutProps) {
  const { view } = useView()

  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (meta) meta.content = THEME_COLORS[view] ?? '#C8A14A'
  }, [view])

  return (
    <div className={`view-${view} min-h-screen`}>
      <GlobalHeader />
      {children}
    </div>
  )
}
