import { useState } from 'react'

interface Snowflake {
  id: number
  left: number
  delay: number
  duration: number
  size: number
}

// Generate snowflakes using lazy initial state to avoid useEffect+setState pattern
const generateSnowflakes = (): Snowflake[] => {
  const flakes: Snowflake[] = []
  for (let i = 0; i < 30; i++) {
    flakes.push({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 7,
      size: 0.5 + Math.random() * 1,
    })
  }
  return flakes
}

// Sparkle SVG component
const Sparkle = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
)

export default function Snowflakes() {
  // Use lazy initial state - function only runs once on mount
  const [snowflakes] = useState<Snowflake[]>(generateSnowflakes)

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {snowflakes.map(flake => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            width: `${flake.size * 16}px`,
            height: `${flake.size * 16}px`,
          }}
        >
          <Sparkle />
        </div>
      ))}
    </div>
  )
}
