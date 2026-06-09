import { useState, useEffect, useRef, useCallback } from 'react'
import type { HeroCarouselImage } from '../../lib/types'

interface ImageCarouselProps {
  images: HeroCarouselImage[]
  autoAdvanceMs?: number
}

export function ImageCarousel({ images, autoAdvanceMs = 6000 }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((index: number) => {
    setActiveIndex(((index % images.length) + images.length) % images.length)
  }, [images.length])

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

  useEffect(() => {
    if (isPaused || images.length <= 1) return
    timerRef.current = setInterval(next, autoAdvanceMs)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, images.length, next, autoAdvanceMs])

  if (images.length === 0) return null

  return (
    <div
      className="image-carousel"
      role="region"
      aria-label="Image carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="image-carousel__track" aria-live="polite" aria-atomic="true">
        {images.map((img, i) => (
          <img
            key={img.url}
            src={img.url}
            alt={img.alt}
            className={`image-carousel__slide${i === activeIndex ? ' image-carousel__slide--active' : ''}`}
            aria-hidden={i !== activeIndex}
          />
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            className="image-carousel__btn image-carousel__btn--prev"
            onClick={prev}
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            className="image-carousel__btn image-carousel__btn--next"
            onClick={next}
            aria-label="Next image"
          >
            ›
          </button>
          <div className="image-carousel__dots" role="tablist" aria-label="Carousel slides">
            {images.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Slide ${i + 1} of ${images.length}`}
                className={`image-carousel__dot${i === activeIndex ? ' image-carousel__dot--active' : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
