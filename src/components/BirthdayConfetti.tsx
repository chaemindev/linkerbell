import { useEffect, useRef } from "react"

const COLORS = ["#fb7185", "#fbbf24", "#a78bfa", "#38bdf8", "#34d399"]

/** Mount with a date key to celebrate once when that day's birthdays are known. */
export function BirthdayConfetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0
    let width = 0
    let height = 0
    let startedAt: number | null = null
    let previousTime: number | null = null

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * ratio
      canvas.height = height * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }
    resize()

    interface Particle {
      kind: "confetti" | "spark"
      x: number
      y: number
      vx: number
      vy: number
      angle: number
      spin: number
      size: number
      color: string
      life: number
      duration: number
    }
    const particles: Particle[] = []
    const rockets: { x: number; y: number; targetY: number; color: string }[] = []
    const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)]
    const balloonCount = width < 640 ? 7 : 13
    const balloons = Array.from({ length: balloonCount }, (_, index) => ({
      position: 0.08 + Math.random() * 0.84,
      y: -100 - Math.random() * Math.min(height * 0.6, 500),
      delay: index === 0 ? 0 : Math.random() * 2400,
      speed: Math.max(140, height / 5) + Math.random() * 110,
      swayAmplitude: 10 + Math.random() * 24,
      swayPeriod: 550 + Math.random() * 650,
      radius: (width < 640 ? 18 : 24) + Math.random() * 10,
      phase: Math.random() * Math.PI * 2,
      color: COLORS[index % COLORS.length],
    }))
    let nextShower = 0
    let nextRocket = 350

    const showerConfetti = () => {
      for (let i = 0; i < (width < 640 ? 30 : 55); i++) {
        const duration = 3 + Math.random()
        particles.push({
          kind: "confetti",
          x: Math.random() * width,
          y: -15 - Math.random() * 120,
          vx: (Math.random() - 0.5) * 160,
          vy: 350 + Math.random() * 100, //
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 18,
          size: 6 + Math.random() * 7,
          color: randomColor(),
          life: duration,
          duration,
        })
      }
    }

    const explode = (x: number, y: number, color: string) => {
      const count = width < 640 ? 45 : 75
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2
        const speed = 110 + Math.random() * Math.min(width * 0.4, 300)
        const duration = 1 + Math.random() * 0.7
        particles.push({
          kind: "spark", x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          angle, spin: 0, size: 2 + Math.random() * 2,
          color: i % 5 === 0 ? "#f59e0b" : color,
          life: duration, duration,
        })
      }
    }

    const stop = () => {
      window.cancelAnimationFrame(frame)
      context.clearRect(0, 0, width, height)
    }

    const draw = (time: number) => {
      if (startedAt === null) startedAt = time
      const elapsed = time - startedAt
      if (elapsed >= 8000 || motionPreference.matches) {
        stop()
        return
      }
      const delta = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.05)
      previousTime = time
      context.clearRect(0, 0, width, height)
      const fade = Math.min(1, (8000 - elapsed) / 1000)
      for (const balloon of balloons) {
        if (elapsed < balloon.delay) continue
        balloon.y += balloon.speed * delta
        if (balloon.y > height + 130) continue
        const sway = Math.sin((elapsed - balloon.delay) / balloon.swayPeriod + balloon.phase)
        const r = balloon.radius
        context.save()
        context.globalAlpha = fade * 0.9
        context.translate(balloon.position * width + sway * balloon.swayAmplitude, balloon.y)
        context.rotate(sway * 0.12)

        // A curved string and tied knot keep the silhouette recognizable in motion.
        context.strokeStyle = "rgba(100, 116, 139, 0.5)"
        context.lineWidth = 1.2
        context.beginPath()
        context.moveTo(0, r * 1.3)
        context.bezierCurveTo(-16 + sway * 8, r + 25, 16 + sway * 8, r + 45, sway * 10, r + 70)
        context.stroke()
        const sheen = context.createRadialGradient(-r * 0.35, -r * 0.45, 1, 0, 0, r * 1.5)
        sheen.addColorStop(0, "#ffffff")
        sheen.addColorStop(0.28, balloon.color)
        sheen.addColorStop(1, balloon.color)
        context.fillStyle = sheen
        context.beginPath()
        context.ellipse(0, 0, r, r * 1.25, 0, 0, Math.PI * 2)
        context.fill()
        context.fillStyle = balloon.color
        context.beginPath()
        context.moveTo(0, r * 1.18)
        context.lineTo(-4, r * 1.4)
        context.lineTo(4, r * 1.4)
        context.closePath()
        context.fill()
        context.restore()
      }
      if (elapsed >= nextShower && elapsed < 4500) {
        showerConfetti()
        nextShower = elapsed + 400
      }
      if (elapsed >= nextRocket && elapsed < 5000) {
        rockets.push({
          x: width * (0.15 + Math.random() * 0.7),
          y: height,
          targetY: height * (0.15 + Math.random() * 0.3),
          color: randomColor(),
        })
        nextRocket = elapsed + 650
      }
      for (let i = rockets.length - 1; i >= 0; i--) {
        const rocket = rockets[i]
        rocket.y -= Math.max(800, height * 1.3) * delta
        if (rocket.y <= rocket.targetY) {
          explode(rocket.x, rocket.targetY, rocket.color)
          rockets.splice(i, 1)
          continue
        }
        context.globalAlpha = fade
        const trail = context.createLinearGradient(rocket.x, rocket.y, rocket.x, rocket.y + 65)
        trail.addColorStop(0, rocket.color)
        trail.addColorStop(1, "transparent")
        context.fillStyle = trail
        context.fillRect(rocket.x - 1.5, rocket.y, 3, 65)
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i]
        particle.life -= delta
        if (particle.life <= 0 || particle.y > height + 60) {
          particles.splice(i, 1)
          continue
        }
        const spark = particle.kind === "spark"
        const drag = Math.exp(-(spark ? 1.6 : 0.6) * delta)
        particle.vx *= drag
        particle.vy = particle.vy * drag + (spark ? 50 : 750) * delta //
        particle.x += particle.vx * delta
        particle.y += particle.vy * delta
        particle.angle += particle.spin * delta
        context.globalAlpha = fade * Math.min(1, particle.life / (spark ? particle.duration : 0.6))
        context.save()
        context.translate(particle.x, particle.y)
        context.fillStyle = particle.color
        if (spark) {
          context.strokeStyle = particle.color
          context.lineWidth = particle.size * 0.7
          context.beginPath()
          context.moveTo(0, 0)
          context.lineTo(-particle.vx * 0.045, -particle.vy * 0.045)
          context.stroke()
          context.beginPath()
          context.arc(0, 0, particle.size, 0, Math.PI * 2)
          context.fill()
        } else {
          context.rotate(particle.angle)
          context.scale(1, 0.45 + Math.abs(Math.cos(particle.angle)) * 0.55)
          context.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2)
        }
        context.restore()
      }
      frame = window.requestAnimationFrame(draw)
    }

    if (!motionPreference.matches) frame = window.requestAnimationFrame(draw)
    motionPreference.addEventListener("change", stop)
    window.addEventListener("resize", resize)
    return () => {
      stop()
      motionPreference.removeEventListener("change", stop)
      window.removeEventListener("resize", resize)
    }
  }, [active])

  return active ? (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] h-full w-full motion-reduce:hidden"
    />
  ) : null
}
