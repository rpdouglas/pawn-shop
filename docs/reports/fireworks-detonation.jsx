import { useState, useEffect, useRef, useCallback } from "react";

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(targetDate) {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

// ─── Fireworks canvas engine ──────────────────────────────────────────────────
// Gold-dominant palette with occasional colour accents
const PALETTES = [
  ["#FFE566", "#C9A84C", "#FFF0A0", "#E8C96A"],   // pure gold
  ["#FFE566", "#C9A84C", "#FFF0A0", "#E8C96A"],   // pure gold (weighted heavier)
  ["#FFE566", "#C9A84C", "#FFF0A0", "#E8C96A"],   // pure gold
  ["#FF6B35", "#FFE566", "#C9A84C", "#FF9966"],   // gold + warm orange
  ["#E8C96A", "#FFFFFF", "#FFE566", "#C9A84C"],   // gold + white star
  ["#C9A84C", "#FFE566", "#FF4444", "#FFB347"],   // gold + red
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

class Particle {
  constructor(x, y, color, angle, speed, life) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = life;
    this.maxLife = life;
    this.radius = 2.2 + Math.random() * 1.8;
    this.gravity = 0.055;
    this.drag = 0.97;
    this.tail = []; // trail points
  }
  update() {
    this.tail.unshift({ x: this.x, y: this.y });
    if (this.tail.length > 6) this.tail.pop();
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }
  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    // Draw tail
    for (let i = 0; i < this.tail.length; i++) {
      const t = this.tail[i];
      const ta = alpha * (1 - i / this.tail.length) * 0.5;
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.radius * (1 - i / this.tail.length) * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = this.color + Math.floor(ta * 255).toString(16).padStart(2, "0");
      ctx.fill();
    }
    // Draw head
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * alpha, 0, Math.PI * 2);
    ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, "0");
    ctx.fill();
    // Glow
    if (alpha > 0.3) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * alpha * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = this.color + Math.floor(alpha * 60).toString(16).padStart(2, "0");
      ctx.fill();
    }
  }
  get dead() { return this.life <= 0; }
}

class Rocket {
  constructor(x, canvasH) {
    this.x = x;
    this.y = canvasH;
    this.targetY = canvasH * (0.15 + Math.random() * 0.45);
    this.speed = 7 + Math.random() * 5;
    this.trail = [];
    this.done = false;
  }
  update() {
    this.trail.unshift({ x: this.x, y: this.y });
    if (this.trail.length > 12) this.trail.pop();
    this.y -= this.speed;
    if (this.y <= this.targetY) this.done = true;
  }
  draw(ctx) {
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const a = (1 - i / this.trail.length) * 0.7;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 2.5 * (1 - i / this.trail.length), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 220, 80, ${a})`;
      ctx.fill();
    }
  }
}

function explode(x, y, particles) {
  const palette = pick(PALETTES);
  const count = 90 + Math.floor(Math.random() * 60);
  const style = Math.random();

  if (style < 0.5) {
    // Classic radial burst
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 2.5 + Math.random() * 4;
      const color = pick(palette);
      const life = 55 + Math.floor(Math.random() * 35);
      particles.push(new Particle(x, y, color, angle, speed, life));
    }
  } else if (style < 0.75) {
    // Double-ring burst
    for (let ring = 0; ring < 2; ring++) {
      const ringCount = ring === 0 ? count : Math.floor(count * 0.5);
      const baseSpeed = ring === 0 ? 3.5 : 1.8;
      for (let i = 0; i < ringCount; i++) {
        const angle = (i / ringCount) * Math.PI * 2;
        const speed = baseSpeed + Math.random() * 1.5;
        const color = ring === 0 ? pick(palette) : palette[0];
        particles.push(new Particle(x, y, color, angle, speed, 60 + ring * 15));
      }
    }
  } else {
    // Chrysanthemum — many short particles + some long streamers
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
      const speed = 1.5 + Math.random() * 5.5;
      const color = pick(palette);
      const life = 45 + Math.floor(Math.random() * 50);
      const p = new Particle(x, y, color, angle, speed, life);
      p.drag = 0.96;
      particles.push(p);
    }
  }

  // Sparkle center flash
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const p = new Particle(x, y, "#FFFFFF", angle, 1 + Math.random() * 2, 20);
    p.radius = 1.5;
    particles.push(p);
  }
}

function useFireworks(canvasRef) {
  const state = useRef({ particles: [], rockets: [], frame: null, lastLaunch: 0 });

  const loop = useCallback((ts) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { particles, rockets } = state.current;

    // Fade trail
    ctx.fillStyle = "rgba(10, 10, 10, 0.22)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Launch rockets periodically
    if (ts - state.current.lastLaunch > 700 + Math.random() * 900) {
      state.current.lastLaunch = ts;
      const x = canvas.width * (0.15 + Math.random() * 0.7);
      rockets.push(new Rocket(x, canvas.height));
    }

    // Update rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
      rockets[i].update();
      rockets[i].draw(ctx);
      if (rockets[i].done) {
        explode(rockets[i].x, rockets[i].y, particles);
        rockets.splice(i, 1);
      }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw(ctx);
      if (particles[i].dead) particles.splice(i, 1);
    }

    state.current.frame = requestAnimationFrame(loop);
  }, [canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    state.current.frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(state.current.frame);
      window.removeEventListener("resize", resize);
    };
  }, [loop, canvasRef]);
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FireworksDetonation() {
  const { d, h, m, s } = useCountdown("2026-07-01T00:00:00");
  const canvasRef = useRef(null);
  const pad = (n) => String(n).padStart(2, "0");

  useFireworks(canvasRef);

  return (
    <div
      style={{
        background: "#0a0a0a",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Georgia', serif",
        overflow: "hidden",
        position: "relative",
        padding: "40px 20px",
      }}
    >
      {/* Fireworks canvas — full bleed background */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      {/* Vignette overlay to keep content readable */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 20%, rgba(10,10,10,0.55) 70%, rgba(10,10,10,0.85) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Content ── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Eyebrow */}
        <p
          style={{
            color: "#C9A84C",
            letterSpacing: "0.35em",
            fontSize: "11px",
            fontFamily: "sans-serif",
            fontWeight: 600,
            textTransform: "uppercase",
            marginBottom: "20px",
            opacity: 0.9,
          }}
        >
          The Pawn Shop · Akwesasne
        </p>

        {/* Title */}
        <h1
          style={{
            fontSize: "clamp(72px, 18vw, 152px)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 0.83,
            margin: "0 0 4px",
            background:
              "linear-gradient(160deg, #F5E27A 0%, #C9A84C 38%, #8B6914 68%, #C9A84C 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          FIRE
          <br />
          WORKS
        </h1>

        {/* Divider */}
        <div
          style={{
            width: "180px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, #C9A84C 30%, #E8C96A 50%, #C9A84C 70%, transparent)",
            margin: "28px auto",
          }}
        />

        <p
          style={{
            color: "#888",
            fontSize: "15px",
            letterSpacing: "0.1em",
            marginBottom: "44px",
            fontStyle: "italic",
          }}
        >
          Celebrate the moment properly.
        </p>

        {/* Countdown */}
        <div style={{ marginBottom: "48px" }}>
          <p
            style={{
              color: "#C9A84C",
              letterSpacing: "0.3em",
              fontSize: "10px",
              fontFamily: "monospace",
              marginBottom: "14px",
              textTransform: "uppercase",
            }}
          >
            ◆ Canada Day Countdown ◆
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {[["d", pad(d)], ["h", pad(h)], ["m", pad(m)], ["s", pad(s)]].map(
              ([label, val], i) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div
                    style={{
                      background: "rgba(10,10,10,0.75)",
                      border: "1px solid rgba(201,168,76,0.25)",
                      borderRadius: "4px",
                      padding: "12px 16px",
                      minWidth: "64px",
                      textAlign: "center",
                      backdropFilter: "blur(6px)",
                      boxShadow:
                        "0 0 24px rgba(201,168,76,0.12) inset, 0 0 0 1px rgba(201,168,76,0.08)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: "36px",
                        fontWeight: 700,
                        color: "#E8C96A",
                        lineHeight: 1,
                        textShadow: "0 0 24px rgba(201,168,76,0.7)",
                      }}
                    >
                      {val}
                    </div>
                    <div
                      style={{
                        fontFamily: "sans-serif",
                        fontSize: "9px",
                        color: "#666",
                        letterSpacing: "0.2em",
                        marginTop: "6px",
                        textTransform: "uppercase",
                      }}
                    >
                      {label}
                    </div>
                  </div>
                  {i < 3 && (
                    <span
                      style={{
                        color: "#C9A84C",
                        fontSize: "28px",
                        fontWeight: 300,
                        opacity: 0.4,
                      }}
                    >
                      :
                    </span>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* CTA */}
        <button
          style={{
            background: "linear-gradient(135deg, #C9A84C, #8B6914)",
            color: "#000",
            border: "none",
            padding: "15px 44px",
            fontSize: "12px",
            fontFamily: "sans-serif",
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            borderRadius: "2px",
            cursor: "pointer",
            boxShadow: "0 0 30px rgba(201,168,76,0.3)",
          }}
        >
          Shop Fireworks
        </button>
      </div>
    </div>
  );
}
