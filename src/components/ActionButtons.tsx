import { useState, useRef, useEffect, type MouseEvent } from 'react'
import { useGameStore } from '../stores/gameStore'
import { playSound, haptic, type SoundType } from '../utils/feedback'
import { useToast } from './Toast'

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  color: string
  glowColor: string
  sound: SoundType
  disabled?: boolean
  ariaLabel?: string
}

// SVG Icons for action buttons
const FeedIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
    <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
  </svg>
)

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
  </svg>
)

const SleepIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
    <path d="M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z"/>
  </svg>
)

const CleanIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
    <path d="M9.5 2C5.36 2 2 5.36 2 9.5c0 .59.08 1.16.21 1.72l2.17-.64C4.13 10.1 4 9.61 4 9.5 4 6.47 6.47 4 9.5 4c2.3 0 4.27 1.41 5.1 3.41l1.84-.55C15.33 4.12 12.66 2 9.5 2zm8.5 7l-3.5 3.5 3.5 3.5 2-2-1.5-1.5 1.5-1.5-2-2zm-8 2.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM12 22c-1.1 0-2-.9-2-2 0-.55.22-1.05.59-1.41l4.83-4.83-1.42-1.42-4.83 4.83c-.36.37-.86.59-1.42.59-1.1 0-2-.9-2-2s.9-2 2-2c.56 0 1.06.23 1.42.59l4.83 4.83 1.42-1.42-4.83-4.83c-.36-.36-.59-.86-.59-1.42 0-1.1.9-2 2-2s2 .9 2 2c0 .56-.23 1.06-.59 1.42l-4.83 4.83 1.42 1.42 4.83-4.83c.36-.37.86-.59 1.42-.59 1.1 0 2 .9 2 2s-.9 2-2 2c-.56 0-1.06-.23-1.42-.59L12 15.17V20c0 1.1.9 2 2 2h-2z"/>
  </svg>
)

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
      <div className={`mb-1 relative z-10 text-white ${iconBounce ? 'icon-bounce' : ''}`}>
        {icon}
      </div>

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
        icon={<FeedIcon />}
        label="Feed"
        onClick={handleFeed}
        color="from-rose-500 to-orange-500"
        glowColor="rgba(244, 63, 94, 0.5)"
        sound="feed"
        ariaLabel="Feed your pet to increase hunger stat"
      />
      <ActionButton
        icon={<PlayIcon />}
        label="Play"
        onClick={handlePlay}
        color="from-amber-400 to-yellow-500"
        glowColor="rgba(251, 191, 36, 0.5)"
        sound="play"
        ariaLabel="Play with your pet to increase happiness"
      />
      <ActionButton
        icon={<SleepIcon />}
        label="Sleep"
        onClick={handleSleep}
        color="from-violet-500 to-purple-600"
        glowColor="rgba(139, 92, 246, 0.5)"
        sound="sleep"
        ariaLabel="Put your pet to sleep to restore energy"
      />
      <ActionButton
        icon={<CleanIcon />}
        label="Clean"
        onClick={handleClean}
        color="from-cyan-400 to-blue-500"
        glowColor="rgba(34, 211, 238, 0.5)"
        sound="clean"
        ariaLabel="Clean your pet to improve cleanliness"
      />
    </div>
  )
}
