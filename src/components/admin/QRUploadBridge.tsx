import { useEffect, useState, useRef } from 'react'
import QRCode from 'qrcode'

interface QRUploadBridgeProps {
  itemId: string
  imageCount: number
}

export default function QRUploadBridge({ itemId, imageCount }: QRUploadBridgeProps) {
  const [open, setOpen] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const prevCountRef = useRef(imageCount)
  const targetUrl = `${window.location.origin}/admin/item-photo/${itemId}`

  useEffect(() => {
    QRCode.toDataURL(targetUrl, { width: 200, margin: 1 }).then(setQrDataUrl).catch(() => {})
  }, [targetUrl])

  // Auto-close when a new photo arrives on the desktop
  useEffect(() => {
    if (imageCount > prevCountRef.current && open) {
      setOpen(false)
    }
    prevCountRef.current = imageCount
  }, [imageCount, open])

  return (
    <div style={{ marginTop: 'var(--space-4)' }}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        style={{
          background: 'none',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          cursor: 'pointer',
          minHeight: '44px',
          padding: '0 var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}
        aria-expanded={open}
        aria-controls="qr-upload-bridge-panel"
      >
        📱 Upload from Phone
      </button>

      {open && (
        <div
          id="qr-upload-bridge-panel"
          role="region"
          aria-label="Phone upload QR code"
          style={{
            marginTop: 'var(--space-3)',
            padding: 'var(--space-6)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-3)',
            position: 'relative',
          }}
        >
          <button
            type="button"
            aria-label="Close QR code panel"
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute',
              top: 'var(--space-2)',
              right: 'var(--space-2)',
              minWidth: '44px',
              minHeight: '44px',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-subheading)',
            }}
          >✕</button>

          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR code — scan with phone to upload a photo"
              width={200}
              height={200}
              style={{ display: 'block' }}
            />
          ) : (
            <div style={{
              width: 200,
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-small)',
            }}>
              Generating…
            </div>
          )}

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            margin: 0,
          }}>
            Scan with your phone — staff sign-in required.
          </p>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            margin: 0,
            wordBreak: 'break-all',
          }}>
            {targetUrl}
          </p>
        </div>
      )}
    </div>
  )
}
