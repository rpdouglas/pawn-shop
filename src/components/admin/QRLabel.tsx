import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import type { ViewType } from '../../lib/types'
import { formatPrice } from '../../lib/format'

interface QRLabelProps {
  id: string
  title: string
  price: number      // CAD cents
  viewTag: ViewType
}

export default function QRLabel({ id, title, price, viewTag }: QRLabelProps) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const itemUrl = `${window.location.origin}/${viewTag}/item/${id}`

  useEffect(() => {
    QRCode.toDataURL(itemUrl, {
      width: 160,
      margin: 1,
      color: { dark: '#080706', light: '#F5F0E8' },
    }).then(setQrDataUrl).catch(() => {})
  }, [itemUrl])

  return (
    <div className="qr-label">
      {qrDataUrl && (
        <img src={qrDataUrl} alt={`QR code for ${title}`} className="qr-image" width={160} height={160} />
      )}
      <div className="qr-label-info">
        <p className="qr-label-title">{title}</p>
        <p className="qr-label-price">{formatPrice(price)}</p>
        <p className="qr-label-url">{itemUrl}</p>
      </div>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => window.print()}
      >
        Print Label
      </button>
    </div>
  )
}
