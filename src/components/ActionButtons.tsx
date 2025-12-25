import { useState, useRef, useEffect, type MouseEvent } from 'react'
import { useGameStore } from '../stores/gameStore'
import { playSound, haptic, type SoundType } from '../utils/feedback'
import { useToast } from './Toast'

interface ActionButtonProps {
  icon: string
  label: string
  onClick: () => void
  color: string
  glowColor: string
  sound: SoundType
  disabled?: boolean
  ariaLabel?: string
}

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

interface ActionButtonsProps {
  onFeed?: () => void
  onPlay?: () => void
  onClean?: () => void
  onSleep?: () => void
}

function ActionButton({ icon, label, onClick, color, glowColor, sound, disabled = false, ariaLabel }: ActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [iconBounce, setIconBounce] = useState(false)
  const [ripples, setRipples] = useState<Ripple[]>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const rippleIdRef = useRef(0)
  const timeoutsRef = useRef<Set<number>>(new Set())

  // Cleanup all timeouts on unmount
  useEffect(() => {
    const currentTimeouts = timeoutsRef.current
    return () => {
      currentTimeouts.forEach(id => clearTimeout(id))
    }
  }, [])

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return

    // Create ripple effect
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 2
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      const newRipple: Ripple = {
        id: rippleIdRef.current++,
        x,
        y,
        size
      }

      setRipples(prev => [...prev, newRipple])

      // Remove ripple after animation with cleanup
      const rippleTimeout = window.setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
        timeoutsRef.current.delete(rippleTimeout)
      }, 600)
      timeoutsRef.current.add(rippleTimeout)
    }

    // Play sound and haptic
    playSound(sound)
    haptic('medium')

    // Press and icon bounce
    setIsPressed(true)
    setIconBounce(true)
    onClick()

    const pressTimeout = window.setTimeout(() => {
      setIsPressed(false)
      setIconBounce(false)
      timeoutsRef.current.delete(pressTimeout)
    }, 300)
    timeoutsRef.current.add(pressTimeout)
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel || label}
      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl
                  transition-all duration-150 btn-3d btn-ripple overflow-hidden
                  ${isPressed ? 'scale-95' : 'hover:scale-105'}
                  ${disabled ? 'btn-disabled' : ''}
                  bg-gradient-to-br ${color}`}
      style={{
        '--glow-color': glowColor
      } as React.CSSProperties}
    >
      {/* Gradient overlay for 3D effect */}
      <div className="absolute inset-0 rounded-2xl
                      bg-gradient-to-b from-white/20 via-transparent to-black/20
                      pointer-events-none" />

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100
                      transition-opacity duration-300 pointer-events-none"
           style={{
             boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`
           }} />

      {/* Ripples */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size
          }}
        />
      ))}

      {/* Icon with bounce animation */}
      <span className={`text-3xl mb-1 relative z-10 ${iconBounce ? 'icon-bounce' : ''}`}>
        {icon}
      </span>

      {/* Label */}
      <span className="text-xs font-semibold text-white/90 relative z-10
                      drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
        {label}
      </span>

      {/* Bottom edge for 3D effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl
                      bg-black/20 pointer-events-none" />
    </button>
  )
}

export default function ActionButtons({ onFeed, onPlay, onClean, onSleep }: ActionButtonsProps) {
  const { feedPet, playWithPet, cleanPet, sleepPet, activePetId } = useGameStore()
  const { showError } = useToast()

  if (!activePetId) return null

  // LOW-004 fix: Wrap actions with error feedback
  const handleFeed = () => {
    if (onFeed) {
      onFeed()
    } else {
      const result = feedPet()
      if (result === null) {
        showError('Unable to feed pet. Please select a pet first.')
      }
    }
  }

  const handlePlay = () => {
    if (onPlay) {
      onPlay()
    } else {
      const result = playWithPet()
      if (result === null) {
        showError('Unable to play. Please select a pet first.')
      }
    }
  }

  const handleClean = () => {
    if (onClean) {
      onClean()
    } else {
      const result = cleanPet()
      if (result === null) {
        showError('Unable to clean pet. Please select a pet first.')
      }
    }
  }

  const handleSleep = () => {
    if (onSleep) {
      onSleep()
    } else {
      const result = sleepPet()
      if (result === null) {
        showError('Unable to put pet to sleep. Please select a pet first.')
      }
    }
  }

  return (
    <div className="grid grid-cols-4 gap-3 px-2">
      <ActionButton
        icon="🍖"
        label="Feed"
        onClick={handleFeed}
        color="from-red-500 to-orange-600"
        glowColor="rgba(239, 68, 68, 0.5)"
        sound="feed"
        ariaLabel="Feed your pet to increase hunger stat"
      />
      <ActionButton
        icon="⚽"
        label="Play"
        onClick={handlePlay}
        color="from-yellow-500 to-amber-600"
        glowColor="rgba(234, 179, 8, 0.5)"
        sound="play"
        ariaLabel="Play with your pet to increase happiness"
      />
      <ActionButton
        icon="💤"
        label="Sleep"
        onClick={handleSleep}
        color="from-purple-500 to-indigo-600"
        glowColor="rgba(168, 85, 247, 0.5)"
        sound="sleep"
        ariaLabel="Put your pet to sleep to restore energy"
      />
      <ActionButton
        icon="🧼"
        label="Clean"
        onClick={handleClean}
        color="from-blue-500 to-cyan-600"
        glowColor="rgba(59, 130, 246, 0.5)"
        sound="clean"
        ariaLabel="Clean your pet to improve cleanliness"
      />
    </div>
  )
}
