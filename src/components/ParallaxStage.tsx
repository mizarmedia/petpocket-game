import { useState, useEffect, useMemo } from 'react'
import type { PetMood } from './pets/PetSprite'

interface ParallaxStageProps {
  petMood: PetMood
  children?: React.ReactNode
  className?: string
}

type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night'

interface Theme {
  sky: string
  clouds: string
  ground: string
  accent: string
}

const THEMES: Record<TimeOfDay, Theme> = {
  dawn: {
    sky: 'linear-gradient(to bottom, #FF9A9E 0%, #FAD0C4 50%, #FBC2EB 100%)',
    clouds: 'rgba(255, 255, 255, 0.6)',
    ground: 'linear-gradient(to bottom, #F8D4BA 0%, #E8C4A4 100%)',
    accent: '#FF9A9E',
  },
  day: {
    sky: 'linear-gradient(to bottom, #4FC3F7 0%, #81D4FA 50%, #B3E5FC 100%)',
    clouds: 'rgba(255, 255, 255, 0.8)',
    ground: 'linear-gradient(to bottom, #A5D6A7 0%, #81C784 100%)',
    accent: '#4FC3F7',
  },
  dusk: {
    sky: 'linear-gradient(to bottom, #FF6B6B 0%, #FF8E53 50%, #FFA07A 100%)',
    clouds: 'rgba(255, 200, 150, 0.7)',
    ground: 'linear-gradient(to bottom, #D4A574 0%, #B8895A 100%)',
    accent: '#FF6B6B',
  },
  night: {
    sky: 'linear-gradient(to bottom, #667EEA 0%, #764BA2 50%, #4A148C 100%)',
    clouds: 'rgba(150, 150, 200, 0.5)',
    ground: 'linear-gradient(to bottom, #5C6BC0 0%, #3F51B5 100%)',
    accent: '#667EEA',
  },
}

// Particle component for various effects
interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  type: 'heart' | 'zzz' | 'sweat' | 'sakura' | 'sparkle'
}

const ParticleElement = ({ particle }: { particle: Particle }) => {
  const getContent = () => {
    switch (particle.type) {
      case 'heart':
        return '♥'
      case 'zzz':
        return 'z'
      case 'sweat':
        return '💧'
      case 'sakura':
        return '🌸'
      case 'sparkle':
        return '✨'
    }
  }

  const getColor = () => {
    switch (particle.type) {
      case 'heart':
        return '#FF69B4'
      case 'zzz':
        return '#9E9E9E'
      case 'sweat':
        return '#64B5F6'
      case 'sakura':
        return '#FFC0CB'
      case 'sparkle':
        return '#FFD700'
    }
  }

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        fontSize: `${particle.size}px`,
        color: getColor(),
        animation: `float-up ${particle.duration}s ease-in infinite`,
        animationDelay: `${particle.delay}s`,
        opacity: 0,
      }}
    >
      {getContent()}
    </div>
  )
}

export default function ParallaxStage({ petMood, children, className = '' }: ParallaxStageProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [particles, setParticles] = useState<Particle[]>([])

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Determine time of day based on hour
  const timeOfDay: TimeOfDay = useMemo(() => {
    const hour = currentTime.getHours()
    if (hour >= 5 && hour < 8) return 'dawn'
    if (hour >= 8 && hour < 17) return 'day'
    if (hour >= 17 && hour < 20) return 'dusk'
    return 'night'
  }, [currentTime])

  const theme = THEMES[timeOfDay]

  // Generate particles based on mood
  useEffect(() => {
    const generateParticles = (): Particle[] => {
      const newParticles: Particle[] = []
      let particleCount = 0
      let particleType: Particle['type'] = 'sakura'

      switch (petMood) {
        case 'happy':
          particleCount = 8
          particleType = 'heart'
          break
        case 'sleeping':
          particleCount = 6
          particleType = 'zzz'
          break
        case 'sad':
          particleCount = 5
          particleType = 'sweat'
          break
        case 'idle':
          particleCount = 6
          particleType = 'sakura'
          break
        case 'eating':
          particleCount = 5
          particleType = 'sparkle'
          break
      }

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 120 - 20, // Start some above viewport
          size: 16 + Math.random() * 12,
          duration: 3 + Math.random() * 2,
          delay: Math.random() * 3,
          type: particleType,
        })
      }

      // Always add ambient sakura petals
      for (let i = 0; i < 4; i++) {
        newParticles.push({
          id: Math.random() + 1000,
          x: Math.random() * 100,
          y: Math.random() * 120 - 20,
          size: 14 + Math.random() * 8,
          duration: 4 + Math.random() * 3,
          delay: Math.random() * 4,
          type: 'sakura',
        })
      }

      return newParticles
    }

    setParticles(generateParticles())
  }, [petMood])

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Sky layer - slowest parallax */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: theme.sky,
        }}
      />

      {/* Stars (night only) */}
      {timeOfDay === 'night' && (
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${2 + Math.random() * 2}px`,
                height: `${2 + Math.random() * 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                animation: `twinkle ${2 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.7,
              }}
            />
          ))}
        </div>
      )}

      {/* Sun/Moon */}
      {timeOfDay === 'day' && (
        <div
          className="absolute rounded-full shadow-lg"
          style={{
            width: '60px',
            height: '60px',
            background: 'radial-gradient(circle, #FFF9C4 0%, #FFF59D 50%, #FFD54F 100%)',
            top: '10%',
            right: '15%',
            boxShadow: '0 0 40px rgba(255, 235, 59, 0.6)',
          }}
        />
      )}
      {timeOfDay === 'night' && (
        <div
          className="absolute rounded-full shadow-lg"
          style={{
            width: '50px',
            height: '50px',
            background: 'radial-gradient(circle, #F5F5F5 0%, #E0E0E0 100%)',
            top: '15%',
            left: '20%',
            boxShadow: '0 0 30px rgba(245, 245, 245, 0.5)',
          }}
        />
      )}

      {/* Cloud layer - medium parallax */}
      <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: 0.8 }}>
        <div
          className="absolute rounded-full blur-sm"
          style={{
            background: theme.clouds,
            width: '120px',
            height: '40px',
            top: '15%',
            left: '10%',
            animation: 'float-cloud-1 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full blur-sm"
          style={{
            background: theme.clouds,
            width: '100px',
            height: '35px',
            top: '25%',
            right: '15%',
            animation: 'float-cloud-2 25s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full blur-sm"
          style={{
            background: theme.clouds,
            width: '90px',
            height: '30px',
            top: '35%',
            left: '60%',
            animation: 'float-cloud-3 30s ease-in-out infinite',
          }}
        />
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <ParticleElement key={particle.id} particle={particle} />
        ))}
      </div>

      {/* Ground layer - fastest parallax */}
      <div
        className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
        style={{
          height: '30%',
          background: theme.ground,
          borderTopLeftRadius: '50% 20px',
          borderTopRightRadius: '50% 20px',
        }}
      >
        {/* Grass blades effect */}
        <div className="absolute bottom-0 left-0 right-0 h-2 opacity-30"
          style={{
            background: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 11px)',
          }}
        />
      </div>

      {/* Content layer (pet) */}
      <div className="relative z-10 flex items-center justify-center h-full">
        {children}
      </div>

      {/* CSS animations */}
      <style>{`
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .absolute, .relative {
            animation: none !important;
            transition: none !important;
          }
        }

        @keyframes float-up {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) translateX(${Math.random() * 40 - 20}px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes float-cloud-1 {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(30px) translateY(-10px);
          }
        }

        @keyframes float-cloud-2 {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(-40px) translateY(-15px);
          }
        }

        @keyframes float-cloud-3 {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(25px) translateY(-8px);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  )
}
