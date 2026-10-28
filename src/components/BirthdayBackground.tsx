import { useEffect, useState, type CSSProperties } from "react"

const COLORS = ["#fb7185", "#fbbf24", "#a78bfa", "#38bdf8", "#34d399"]

export function BirthdayBackground() {
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 3000)
    const onVisibility = () => setPaused(document.hidden)
    onVisibility()
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  if (!ready) return null

  return (
    <div aria-hidden="true" className="birthday-background pointer-events-none fixed inset-0 z-0 overflow-hidden motion-reduce:hidden">
      {Array.from({ length: 32 }, (_, index) => (
        <span
          key={index}
          className="birthday-background-piece absolute -top-6 block"
          style={{
            left: `${(index * 37.7) % 100}%`,
            width: `${4 + index % 4}px`,
            height: `${7 + index % 5}px`,
            backgroundColor: COLORS[index % COLORS.length],
            borderRadius: index % 3 === 0 ? "50%" : "2px",
            animationDuration: `${16 + index % 11}s`,
            animationDelay: `${-((index * 7.3) % 26)}s`,
            animationPlayState: paused ? "paused" : "running",
            "--confetti-drift": `${(index % 2 ? 1 : -1) * (20 + index % 45)}px`,
          } as CSSProperties}
        />
      ))}
    </div>
  )
}
