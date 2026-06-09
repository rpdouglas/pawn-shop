import { useState } from 'react'

interface YouTubeFacadeProps {
  videoId: string
  title: string
}

export function YouTubeFacade({ videoId, title }: YouTubeFacadeProps) {
  const [isActivated, setIsActivated] = useState(false)
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

  if (isActivated) {
    return (
      <div className="youtube-facade youtube-facade--active">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="youtube-facade__iframe"
        />
      </div>
    )
  }

  return (
    <div className="youtube-facade">
      <img
        src={thumbnailUrl}
        alt={title}
        className="youtube-facade__thumbnail"
        loading="lazy"
      />
      <button
        className="youtube-facade__play"
        onClick={() => setIsActivated(true)}
        aria-label={`Play video: ${title}`}
      >
        <svg viewBox="0 0 68 48" className="youtube-facade__play-icon" aria-hidden="true">
          <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#f00" />
          <path d="M45 24 27 14v20" fill="#fff" />
        </svg>
      </button>
    </div>
  )
}
