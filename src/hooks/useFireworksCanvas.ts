import { useEffect, type RefObject } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrailPoint {
  x: number
  y: number
}

type EpisodePhase = 'quiet' | 'active' | 'fadeout'

interface EngineState {
  particles: Particle[]
  rockets: Rocket[]
  rafId: number | null
  phase: EpisodePhase
  episodeTimer: number | null
  rocketTimer: number | null
}

// ─── Canvas Colour Palette ────────────────────────────────────────────────────
//
// Canvas 2D fillStyle cannot accept CSS custom properties (var(--*)).
// The primary/accent values map directly to .view-fireworks design tokens:
//   AMBER = --color-accent  (#E8A020 amber spark)
//   RED   = --color-primary (#C0392B)
// The intermediate gold tones are rendering-only particle colours with no
// equivalent design token. Documented exception — see decision 0039.

const AMBER = '#E8A020'  // --color-accent (.view-fireworks)
const RED   = '#C0392B'  // --color-primary (.view-fireworks)

const PALETTES: readonly (readonly string[])[] = [
  ['#FFE566', '#C9A84C', '#FFF0A0', AMBER],
  ['#FFE566', '#C9A84C', '#FFF0A0', AMBER],
  ['#FFE566', '#C9A84C', '#FFF0A0', AMBER],
  [AMBER, '#FFE566', '#C9A84C', '#FF9966'],
  ['#E8C96A', '#FFFFFF', '#FFE566', AMBER],
  ['#C9A84C', AMBER, RED, '#FFB347'],
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function withAlpha(hex: string, alpha: number): string {
  return hex + Math.floor(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0')
}

// ─── Particle ─────────────────────────────────────────────────────────────────

class Particle {
  x: number
  y: number
  color: string
  vx: number
  vy: number
  life: number
  private readonly maxLife: number
  radius: number
  gravity: number
  drag: number
  private tail: TrailPoint[]

  constructor(x: number, y: number, color: string, angle: number, speed: number, life: number) {
    this.x = x
    this.y = y
    this.color = color
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed
    this.life = life
    this.maxLife = life
    this.radius = 2.2 + Math.random() * 1.8
    this.gravity = 0.055
    this.drag = 0.97
    this.tail = []
  }

  get dead(): boolean {
    return this.life <= 0
  }

  update(): void {
    this.tail.unshift({ x: this.x, y: this.y })
    if (this.tail.length > 6) this.tail.pop()
    this.vx *= this.drag
    this.vy *= this.drag
    this.vy += this.gravity
    this.x += this.vx
    this.y += this.vy
    this.life--
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const alpha = Math.max(0, this.life / this.maxLife)
    for (let i = 0; i < this.tail.length; i++) {
      const t = this.tail[i]
      const ta = alpha * (1 - i / this.tail.length) * 0.5
      ctx.beginPath()
      ctx.arc(t.x, t.y, this.radius * (1 - i / this.tail.length) * 0.7, 0, Math.PI * 2)
      ctx.fillStyle = withAlpha(this.color, ta)
      ctx.fill()
    }
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius * alpha, 0, Math.PI * 2)
    ctx.fillStyle = withAlpha(this.color, alpha)
    ctx.fill()
    if (alpha > 0.3) {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius * alpha * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = withAlpha(this.color, alpha * 0.24)
      ctx.fill()
    }
  }
}

// ─── Rocket ───────────────────────────────────────────────────────────────────

class Rocket {
  x: number
  y: number
  private readonly targetY: number
  private readonly speed: number
  private trail: TrailPoint[]
  done: boolean

  constructor(x: number, canvasH: number) {
    this.x = x
    this.y = canvasH
    this.targetY = canvasH * (0.15 + Math.random() * 0.45)
    this.speed = 7 + Math.random() * 5
    this.trail = []
    this.done = false
  }

  update(): void {
    this.trail.unshift({ x: this.x, y: this.y })
    if (this.trail.length > 12) this.trail.pop()
    this.y -= this.speed
    if (this.y <= this.targetY) this.done = true
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i]
      const a = (1 - i / this.trail.length) * 0.7
      ctx.beginPath()
      ctx.arc(t.x, t.y, 2.5 * (1 - i / this.trail.length), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 220, 80, ${a})` // warm gold rocket trail
      ctx.fill()
    }
  }
}

// ─── Explode ──────────────────────────────────────────────────────────────────

function explode(x: number, y: number, particles: Particle[]): void {
  const palette = pick(PALETTES)
  const count = 90 + Math.floor(Math.random() * 60)
  const style = Math.random()

  if (style < 0.5) {
    // Classic radial burst
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const speed = 2.5 + Math.random() * 4
      particles.push(new Particle(x, y, pick(palette), angle, speed, 55 + Math.floor(Math.random() * 35)))
    }
  } else if (style < 0.75) {
    // Double-ring burst
    for (let ring = 0; ring < 2; ring++) {
      const ringCount = ring === 0 ? count : Math.floor(count * 0.5)
      const baseSpeed = ring === 0 ? 3.5 : 1.8
      for (let i = 0; i < ringCount; i++) {
        const angle = (i / ringCount) * Math.PI * 2
        const speed = baseSpeed + Math.random() * 1.5
        const color = ring === 0 ? pick(palette) : palette[0]
        particles.push(new Particle(x, y, color, angle, speed, 60 + ring * 15))
      }
    }
  } else {
    // Chrysanthemum — irregular burst with drag variation
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.15
      const speed = 1.5 + Math.random() * 5.5
      const p = new Particle(x, y, pick(palette), angle, speed, 45 + Math.floor(Math.random() * 50))
      p.drag = 0.96
      particles.push(p)
    }
  }

  // Centre flash
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2
    const p = new Particle(x, y, '#FFFFFF', angle, 1 + Math.random() * 2, 20)
    p.radius = 1.5
    particles.push(p)
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
//
// Interval-burst ("cinematic moments") mode.
// Episode cycle: 4 rockets launch in a staggered salvo (~2s active)
//   → particles fade out (fadeout phase, ~1–2s)
//   → 6s quiet (no rAF running)
//   → repeat
// First episode fires 800ms after mount.
// Fully disabled when prefers-reduced-motion: reduce is set.

export function useFireworksCanvas(canvasRef: RefObject<HTMLCanvasElement | null>): void {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const maybeCanvas = canvasRef.current
    if (!maybeCanvas) return
    // Re-bind with explicit type so TypeScript preserves HTMLCanvasElement
    // (not HTMLCanvasElement | null) across nested closure boundaries.
    const canvas: HTMLCanvasElement = maybeCanvas

    const resize = (): void => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const engine: EngineState = {
      particles: [],
      rockets: [],
      rafId: null,
      phase: 'quiet',
      episodeTimer: null,
      rocketTimer: null,
    }

    function drawFrame(): void {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Semi-transparent fill creates particle trailing effect.
      // rgba(26, 10, 10) = #1A0A0A = --color-bg (.view-fireworks)
      // Canvas API cannot use CSS custom properties directly.
      const fadeAlpha = engine.phase === 'fadeout' ? 0.15 : 0.22
      ctx.fillStyle = `rgba(26, 10, 10, ${fadeAlpha})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = engine.rockets.length - 1; i >= 0; i--) {
        engine.rockets[i].update()
        engine.rockets[i].draw(ctx)
        if (engine.rockets[i].done) {
          explode(engine.rockets[i].x, engine.rockets[i].y, engine.particles)
          engine.rockets.splice(i, 1)
        }
      }

      for (let i = engine.particles.length - 1; i >= 0; i--) {
        engine.particles[i].update()
        engine.particles[i].draw(ctx)
        if (engine.particles[i].dead) engine.particles.splice(i, 1)
      }

      // Fadeout complete: clear canvas, pause rAF, schedule next episode
      if (
        engine.phase === 'fadeout' &&
        engine.rockets.length === 0 &&
        engine.particles.length === 0
      ) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        engine.phase = 'quiet'
        if (engine.rafId !== null) {
          cancelAnimationFrame(engine.rafId)
          engine.rafId = null
        }
        engine.episodeTimer = window.setTimeout(startEpisode, 6000)
        return
      }

      engine.rafId = requestAnimationFrame(drawFrame)
    }

    function launchRocket(salvoIndex: number): void {
      if (engine.phase !== 'active') return
      engine.rockets.push(
        new Rocket(canvas.width * (0.15 + Math.random() * 0.7), canvas.height),
      )
      if (salvoIndex < 3) {
        engine.rocketTimer = window.setTimeout(
          () => launchRocket(salvoIndex + 1),
          350 + Math.random() * 250,
        )
      } else {
        // All 4 rockets launched — transition to fadeout after burst settles
        engine.rocketTimer = window.setTimeout(() => {
          engine.phase = 'fadeout'
        }, 2200)
      }
    }

    function startEpisode(): void {
      engine.phase = 'active'
      if (engine.rafId === null) {
        engine.rafId = requestAnimationFrame(drawFrame)
      }
      launchRocket(0)
    }

    // First episode after a short delay to let hero content render first
    engine.episodeTimer = window.setTimeout(startEpisode, 800)

    return () => {
      window.removeEventListener('resize', resize)
      if (engine.rafId !== null) cancelAnimationFrame(engine.rafId)
      if (engine.episodeTimer !== null) clearTimeout(engine.episodeTimer)
      if (engine.rocketTimer !== null) clearTimeout(engine.rocketTimer)
    }
  }, [canvasRef])
}
