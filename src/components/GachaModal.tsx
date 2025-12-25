import { useState, useEffect, useCallback, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import type { PetSpecies } from '../stores/gameStore'
import { playSound, haptic, type SoundType } from '../utils/feedback'

interface GachaModalProps {
  onClose: () => void
}

interface Confetti {
  id: number
  x: number
  color: string
  delay: number
  duration: number
}

interface Particle {
  id: number
  x: number
  y: number
  color: string
  tx: number
  ty: number
}

const CONFETTI_COLORS = ['#fbbf24', '#f472b6', '#60a5fa', '#4ade80', '#c084fc', '#f97316']
const PARTICLE_COLORS = ['#fbbf24', '#ffffff', '#fcd34d', '#fef3c7']
const RAINBOW_COLORS = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff']

type RevealPhase = 'idle' | 'shaking' | 'cracking' | 'suspense' | 'flash' | 'reveal'

export default function GachaModal({ onClose }: GachaModalProps) {
  const { coins, doGachaPull } = useGameStore()
  const [phase, setPhase] = useState<RevealPhase>('idle')
  const [result, setResult] = useState<PetSpecies | null>(null)
  const [confetti, setConfetti] = useState<Confetti[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [screenShake, setScreenShake] = useState(false)
  const [modalEntered, setModalEntered] = useState(false)
  const [showScreenFlash, setShowScreenFlash] = useState(false)
  const [showScreenCrack, setShowScreenCrack] = useState(false)
  const [rainbowParticles, setRainbowParticles] = useState<Particle[]>([])

  // Track all timeouts for cleanup on unmount
  const timeoutsRef = useRef<Set<number>>(new Set())

  // Helper to create timeout with cleanup tracking
  const safeTimeout = useCallback((callback: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timeoutsRef.current.delete(id)
      callback()
    }, delay)
    timeoutsRef.current.add(id)
    return id
  }, [])

  // Cleanup all timeouts on unmount
  useEffect(() => {
    const currentTimeouts = timeoutsRef.current
    return () => {
      currentTimeouts.forEach(id => clearTimeout(id))
    }
  }, [])

  // Handle Escape key to close modal (accessibility)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase === 'idle') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, phase])

  // Trigger modal entrance animation
  useEffect(() => {
    requestAnimationFrame(() => setModalEntered(true))
  }, [])

  // Create confetti for rare+ pulls
  const createConfetti = useCallback((count: number) => {
    const newConfetti: Confetti[] = []
    for (let i = 0; i < count; i++) {
      newConfetti.push({
        id: Date.now() + i,
        x: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2
      })
    }
    setConfetti(newConfetti)

    // Clear confetti after animation
    safeTimeout(() => setConfetti([]), 4000)
  }, [safeTimeout])

  // Create particle burst on reveal
  const createParticleBurst = useCallback((count: number, rainbow: boolean = false) => {
    const newParticles: Particle[] = []
    const colors = rainbow ? RAINBOW_COLORS : PARTICLE_COLORS

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const distance = 80 + Math.random() * 60
      newParticles.push({
        id: Date.now() + i,
        x: 50,
        y: 40,
        color: colors[i % colors.length],
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance
      })
    }

    if (rainbow) {
      setRainbowParticles(newParticles)
      safeTimeout(() => setRainbowParticles([]), 1000)
    } else {
      setParticles(newParticles)
      safeTimeout(() => setParticles([]), 800)
    }
  }, [safeTimeout])

  const handlePull = () => {
    if (coins < 100 || phase !== 'idle') return

    // Execute pull immediately to get result
    const species = doGachaPull()
    if (!species) {
      playSound('error')
      haptic('error')
      return
    }

    setResult(species)
    setPhase('shaking')
    playSound('gacha_roll')
    haptic('medium')

    // Phase 1: Shaking (1.2s)
    safeTimeout(() => {
      setPhase('cracking')
    }, 1200)

    // Phase 2: Cracking (0.8s)
    safeTimeout(() => {
      // For rare+ add suspense phase
      if (species.rarity >= 3) {
        setPhase('suspense')
        haptic('light')
      } else {
        setPhase('reveal')
        playSound(getRevealSound(species.rarity))
        getRevealHaptic(species.rarity)
      }
    }, 2000)

    // Phase 3: Suspense for rare+ (1.5s) - build tension!
    if (species.rarity >= 3) {
      safeTimeout(() => {
        setPhase('flash')
        setShowScreenFlash(true)
        haptic('heavy')

        // Legendary gets screen crack!
        if (species.rarity >= 5) {
          setShowScreenCrack(true)
          setScreenShake(true)
        }

        // Hide flash after duration based on rarity
        const flashDuration = species.rarity >= 5 ? 600 : species.rarity >= 4 ? 400 : 200
        safeTimeout(() => {
          setShowScreenFlash(false)
          if (species.rarity >= 5) {
            setScreenShake(false)
          }
        }, flashDuration)
      }, 3500)

      // Phase 4: Reveal
      safeTimeout(() => {
        setPhase('reveal')
        playSound(getRevealSound(species.rarity))
        getRevealHaptic(species.rarity)

        // Trigger effects based on rarity
        if (species.rarity >= 5) {
          createConfetti(60)
          createParticleBurst(24, true) // Rainbow!
        } else if (species.rarity >= 4) {
          createConfetti(40)
          createParticleBurst(18)
        } else if (species.rarity >= 3) {
          createConfetti(20)
          createParticleBurst(12)
        }

        // Hide screen crack after reveal
        if (species.rarity >= 5) {
          safeTimeout(() => setShowScreenCrack(false), 1500)
        }
      }, 3500 + (species.rarity >= 5 ? 600 : species.rarity >= 4 ? 400 : 200) + 100)
    } else {
      // Common/Uncommon: Quick reveal
      safeTimeout(() => {
        setPhase('reveal')
        playSound(getRevealSound(species.rarity))
        getRevealHaptic(species.rarity)
      }, 2100)
    }
  }

  const getRarityLabel = (rarity: number) => {
    switch (rarity) {
      case 1: return 'Common'
      case 2: return 'Uncommon'
      case 3: return 'Rare'
      case 4: return 'Epic'
      case 5: return 'LEGENDARY'
      default: return ''
    }
  }

  const getRevealSound = (rarity: number): SoundType => {
    switch (rarity) {
      case 5: return 'gacha_reveal_legendary'
      case 4: return 'gacha_reveal_epic'
      case 3: return 'gacha_reveal_rare'
      default: return 'gacha_reveal_common'
    }
  }

  const getRevealHaptic = (rarity: number) => {
    if (rarity >= 5) {
      haptic('heavy')
      setTimeout(() => haptic('success'), 100)
      setTimeout(() => haptic('heavy'), 200)
    } else if (rarity >= 4) {
      haptic('heavy')
    } else if (rarity >= 3) {
      haptic('medium')
    } else {
      haptic('light')
    }
  }

  const handleClose = () => {
    if (phase === 'reveal' || phase === 'idle') {
      playSound('tap')
      haptic('light')
      onClose()
    }
  }

  const handleReset = () => {
    playSound('tap')
    haptic('light')
    setPhase('idle')
    setResult(null)
    setConfetti([])
    setParticles([])
    setRainbowParticles([])
    setShowScreenCrack(false)
  }

  // Render screen flash
  const renderScreenFlash = () => {
    if (!showScreenFlash || !result) return null

    const flashColor = result.rarity >= 5
      ? 'bg-gradient-to-r from-purple-400 via-pink-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400'
      : result.rarity >= 4
      ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400'
      : 'bg-white'

    return (
      <div
        className={`fixed inset-0 z-50 ${flashColor} animate-pulse pointer-events-none`}
        style={{ animationDuration: '0.15s' }}
      />
    )
  }

  // Render screen crack overlay
  const renderScreenCrack = () => {
    if (!showScreenCrack) return null

    return (
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Crack lines - creating a shattered glass effect */}
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="crackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.2 }} />
            </linearGradient>
          </defs>
          {/* Main cracks radiating from center */}
          <path
            d="M 50 50 L 10 10"
            stroke="url(#crackGradient)"
            strokeWidth="0.3"
            fill="none"
            className="animate-[draw_0.3s_ease-out_forwards]"
            style={{ strokeDasharray: 100, strokeDashoffset: 100 }}
          />
          <path
            d="M 50 50 L 90 15"
            stroke="url(#crackGradient)"
            strokeWidth="0.4"
            fill="none"
            className="animate-[draw_0.3s_ease-out_0.05s_forwards]"
            style={{ strokeDasharray: 100, strokeDashoffset: 100 }}
          />
          <path
            d="M 50 50 L 95 55"
            stroke="url(#crackGradient)"
            strokeWidth="0.35"
            fill="none"
            className="animate-[draw_0.3s_ease-out_0.1s_forwards]"
            style={{ strokeDasharray: 100, strokeDashoffset: 100 }}
          />
          <path
            d="M 50 50 L 85 90"
            stroke="url(#crackGradient)"
            strokeWidth="0.3"
            fill="none"
            className="animate-[draw_0.3s_ease-out_0.15s_forwards]"
            style={{ strokeDasharray: 100, strokeDashoffset: 100 }}
          />
          <path
            d="M 50 50 L 15 85"
            stroke="url(#crackGradient)"
            strokeWidth="0.4"
            fill="none"
            className="animate-[draw_0.3s_ease-out_0.2s_forwards]"
            style={{ strokeDasharray: 100, strokeDashoffset: 100 }}
          />
          <path
            d="M 50 50 L 5 45"
            stroke="url(#crackGradient)"
            strokeWidth="0.35"
            fill="none"
            className="animate-[draw_0.3s_ease-out_0.25s_forwards]"
            style={{ strokeDasharray: 100, strokeDashoffset: 100 }}
          />
          {/* Secondary cracks */}
          <path
            d="M 30 30 L 20 5"
            stroke="url(#crackGradient)"
            strokeWidth="0.2"
            fill="none"
            className="animate-[draw_0.2s_ease-out_0.3s_forwards]"
            style={{ strokeDasharray: 50, strokeDashoffset: 50 }}
          />
          <path
            d="M 70 30 L 85 10"
            stroke="url(#crackGradient)"
            strokeWidth="0.2"
            fill="none"
            className="animate-[draw_0.2s_ease-out_0.35s_forwards]"
            style={{ strokeDasharray: 50, strokeDashoffset: 50 }}
          />
        </svg>
      </div>
    )
  }

  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center p-4
                  modal-backdrop bg-black/70
                  ${modalEntered ? 'modal-backdrop-enter' : 'opacity-0'}
                  ${screenShake ? 'screen-shake' : ''}`}
      onClick={handleClose}
    >
      {renderScreenFlash()}
      {renderScreenCrack()}

      {/* Confetti */}
      {confetti.map(c => (
        <div
          key={c.id}
          className="confetti"
          style={{
            left: `${c.x}%`,
            top: '-10px',
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}

      <div
        className={`glass-dark rounded-3xl p-6 w-full max-w-sm shadow-2xl relative
                   ${modalEntered ? 'modal-enter' : 'translate-y-full opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient border glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20
                       blur-xl -z-10 opacity-50" />

        <h2 className="text-2xl font-bold text-center mb-6">
          <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500
                          bg-clip-text text-transparent drop-shadow-lg">
            Gacha Machine
          </span>
        </h2>

        {/* Gacha display area */}
        <div className={`relative h-52 flex items-center justify-center mb-6
                        glass rounded-2xl overflow-hidden
                        ${phase === 'reveal' && result ? `rarity-bg-${result.rarity}` : ''}`}>

          {/* Legendary light beam */}
          {phase === 'reveal' && result && result.rarity >= 5 && (
            <div className="legendary-beam" />
          )}

          {/* Particles */}
          {particles.map(p => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                backgroundColor: p.color,
                '--tx': `${p.tx}px`,
                '--ty': `${p.ty}px`
              } as React.CSSProperties}
            />
          ))}

          {/* Rainbow particles for legendary */}
          {rainbowParticles.map(p => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                backgroundColor: p.color,
                '--tx': `${p.tx}px`,
                '--ty': `${p.ty}px`,
                width: '12px',
                height: '12px',
                boxShadow: `0 0 10px ${p.color}`
              } as React.CSSProperties}
            />
          ))}

          {/* Initial state */}
          {phase === 'idle' && (
            <div className="text-center animate-float">
              <span className="text-7xl drop-shadow-lg">🥚</span>
              <p className="text-gray-400 mt-3 text-sm">Tap to hatch!</p>
            </div>
          )}

          {/* Shaking state */}
          {phase === 'shaking' && (
            <div className="gacha-shake">
              <span className="text-7xl drop-shadow-lg">🥚</span>
            </div>
          )}

          {/* Egg cracking state */}
          {phase === 'cracking' && (
            <div className="egg-crack">
              <span className="text-7xl">🥚</span>
            </div>
          )}

          {/* Suspense phase - darkened egg with glow */}
          {phase === 'suspense' && result && (
            <div className="text-center">
              <div className={`animate-pulse ${
                result.rarity >= 5 ? 'scale-110' : result.rarity >= 4 ? 'scale-105' : 'scale-100'
              }`}>
                <span
                  className="text-7xl drop-shadow-lg"
                  style={{
                    filter: `brightness(0.5) drop-shadow(0 0 20px ${result.color})`
                  }}
                >
                  🥚
                </span>
              </div>
              <p className="text-yellow-300 mt-3 text-sm font-bold animate-pulse">
                {result.rarity >= 5 ? '✨ Something incredible... ✨' :
                 result.rarity >= 4 ? '⭐ Something special! ⭐' :
                 '✨ Something rare! ✨'}
              </p>
            </div>
          )}

          {/* Flash phase - bright white/rainbow */}
          {phase === 'flash' && result && (
            <div className="text-center">
              <div className="text-8xl animate-ping" style={{ animationDuration: '0.3s' }}>
                {result.rarity >= 5 ? '🌟' : '✨'}
              </div>
            </div>
          )}

          {/* Result reveal */}
          {phase === 'reveal' && result && (
            <div className="gacha-reveal text-center z-10">
              <span
                className="text-8xl drop-shadow-lg block"
                style={{
                  filter: result.rarity >= 5
                    ? `drop-shadow(0 0 30px ${result.color}) drop-shadow(0 0 60px ${result.color}) brightness(1.2)`
                    : result.rarity >= 4
                    ? `drop-shadow(0 0 30px ${result.color}) drop-shadow(0 0 60px ${result.color})`
                    : result.rarity >= 3
                    ? `drop-shadow(0 0 15px ${result.color})`
                    : 'none'
                }}
              >
                {result.emoji}
              </span>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">{result.name}</h3>
                <p className={`text-base font-bold rarity-${result.rarity} mt-1`}>
                  {'⭐'.repeat(result.rarity)} {getRarityLabel(result.rarity)}
                </p>
              </div>
            </div>
          )}

          {/* Sparkles for rare+ */}
          {phase === 'reveal' && result && result.rarity >= 3 && (
            <>
              <span className="absolute top-4 left-4 text-2xl animate-ping">✨</span>
              <span className="absolute top-8 right-8 text-xl animate-ping" style={{ animationDelay: '0.1s' }}>✨</span>
              <span className="absolute bottom-8 left-8 text-xl animate-ping" style={{ animationDelay: '0.2s' }}>✨</span>
              <span className="absolute bottom-4 right-4 text-2xl animate-ping" style={{ animationDelay: '0.3s' }}>✨</span>
              {result.rarity >= 5 && (
                <>
                  <span className="absolute top-1/2 left-4 text-lg animate-ping" style={{ animationDelay: '0.15s' }}>🌟</span>
                  <span className="absolute top-1/2 right-4 text-lg animate-ping" style={{ animationDelay: '0.25s' }}>🌟</span>
                </>
              )}
            </>
          )}
        </div>

        {/* Drop rates */}
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-xs text-gray-500 mb-5">
          <span className="rarity-1">Common 60%</span>
          <span className="text-gray-600">|</span>
          <span className="rarity-2">Uncommon 25%</span>
          <span className="text-gray-600">|</span>
          <span className="rarity-3">Rare 10%</span>
          <span className="text-gray-600">|</span>
          <span className="rarity-4">Epic 4%</span>
          <span className="text-gray-600">|</span>
          <span className="rarity-5">Legendary 1%</span>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          {phase === 'reveal' ? (
            <button
              onClick={handleReset}
              className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600
                        rounded-xl font-bold text-white shadow-lg btn-3d
                        hover:scale-[1.02] transition-transform"
            >
              {result && result.rarity >= 5 ? '🌟 LEGENDARY! Roll Again? 🌟' :
               result && result.rarity >= 4 ? '✨ EPIC! Roll Again? ✨' :
               result && result.rarity >= 3 ? '⭐ RARE! Roll Again? ⭐' :
               'Awesome! Roll Again?'}
            </button>
          ) : (
            <button
              onClick={handlePull}
              disabled={coins < 100 || phase !== 'idle'}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg btn-3d
                         ${coins >= 100 && phase === 'idle'
                           ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:scale-[1.02]'
                           : 'bg-gray-600 cursor-not-allowed btn-disabled'
                         } transition-transform`}
            >
              {phase !== 'idle' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🎰</span>
                  {phase === 'suspense' ? 'Building suspense...' : 'Hatching...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🥚</span>
                  Hatch! (100 💰)
                </span>
              )}
            </button>
          )}

          <button
            onClick={handleClose}
            disabled={phase !== 'idle' && phase !== 'reveal'}
            className={`w-full py-2.5 transition hover:bg-white/5 rounded-xl
                       ${phase === 'idle' || phase === 'reveal'
                         ? 'text-gray-400 hover:text-white'
                         : 'text-gray-600 cursor-not-allowed'}`}
          >
            Close
          </button>
        </div>

        {/* Current coins */}
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full">
            <span className="text-lg">💰</span>
            <span className="text-lg font-bold text-yellow-400 tabular-nums">{coins}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
