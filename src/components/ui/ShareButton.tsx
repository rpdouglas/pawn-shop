import { useState } from 'react'
import Button from './Button'

interface ShareButtonProps {
  title: string
  url: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  style?: React.CSSProperties
}

export default function ShareButton({ 
  title, 
  url, 
  variant = 'secondary', 
  size = 'md',
  className = '', 
  style 
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        })
      } catch (err) {
        // Fallback to clipboard if user didn't intentionally abort
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard()
        }
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {
        // Ignore write errors silently per standard UX
      })
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        className={className}
        style={{
          background: 'none',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 'var(--text-heading)',
          color: copied ? 'var(--color-primary)' : 'var(--color-text-muted)',
          transition: 'all 0.2s ease-in-out',
          ...style,
        }}
        aria-label="Share this item"
        title="Share this item"
      >
        {copied ? '✓' : '➦'}
      </button>
    )
  }

  return (
    <Button 
      variant={variant} 
      size={size}
      className={className} 
      style={style} 
      onClick={handleShare}
    >
      {copied ? 'Link copied!' : 'Share'}
    </Button>
  )
}
