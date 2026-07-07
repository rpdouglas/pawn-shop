import { useEffect, useRef } from 'react'

const EMBED_SRC = 'https://thepawnshop.trafficstores.ca/shop/embed.js'

export default function ShopMenu() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (container.querySelector('script[src*="embed.js"]')) return

    const s = document.createElement('script')
    s.src = EMBED_SRC
    s.async = true
    s.dataset.mode = 'menu'
    s.dataset.section = 'category:1804'
    
    s.dataset.layout = 'grid'
    s.dataset.limit = '99'
    s.dataset.title = 'Liquidation Items'                 
    s.dataset.theme = 'bold'
    s.dataset.hideViewAll = 'true'
          
    
    const injectTimeout = setTimeout(() => {
      container.appendChild(s)
    }, 50)

    return () => {
      clearTimeout(injectTimeout)
      s.remove()
      container.innerHTML = ''
    }
  }, [])

  return <div data-bpos-shop ref={containerRef} />
}