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

export default function Snowflakes() {
  // Use lazy initial state - function only runs once on mount
  const [snowflakes] = useState<Snowflake[]>(generateSnowflakes)

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {snowflakes.map(flake => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            fontSize: `${flake.size}rem`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  )
}
