import { useState, useEffect, useCallback, useRef } from 'react'
import { useGameStore } from '../../stores/gameStore'

interface CatchGameProps {
  onClose: () => void
}

interface FallingTreat {
  id: number
  x: number
  y: number
  emoji: string
  speed: number
  caught: boolean
  missed: boolean
}

const TREAT_EMOJIS = ['🍖', '🍗', '🥩', '🍕', '🌭', '🍔', '🥓', '🍪', '🧁', '🍩']
const GAME_DURATION = 30 // seconds
const INITIAL_SPAWN_RATE = 1000 // ms between spawns
const MIN_SPAWN_RATE = 400
const INITIAL_FALL_SPEED = 2
const MAX_FALL_SPEED = 5

export default function CatchGame({ onClose }: CatchGameProps) {
  const { addCoins, playMiniGame } = useGameStore()
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [treats, setTreats] = useState<FallingTreat[]>([])
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([])
  const [pointPopups, setPointPopups] = useState<{ id: number; x: number; y: number; text: string; color: string }[]>([])
  const [screenShake, setScreenShake] = useState(false)
  const [coinsEarned, setCoinsEarned] = useState(0)

  const gameAreaRef = useRef<HTMLDivElement>(null)
  const treatIdRef = useRef(0)
  const sparkleIdRef = useRef(0)
  const popupIdRef = useRef(0)
  const difficultyRef = useRef(1)

  // Sound hook placeholders - ready for future implementation
  const onCatch = useCallback(() => {
    // Sound hook: play catch sound
  }, [])

  const onMiss = useCallback(() => {
    // Sound hook: play miss sound
  }, [])

  const onCombo = useCallback(() => {
    // Sound hook: play combo sound
  }, [])

  // Spawn treats
  useEffect(() => {
    if (gameState !== 'playing') return

    const spawnTreat = () => {
      const gameArea = gameAreaRef.current
      if (!gameArea) return

      const width = gameArea.clientWidth
      const treatSize = 48
      const x = Math.random() * (width - treatSize)
      const speed = INITIAL_FALL_SPEED + (difficultyRef.current - 1) * 0.5
      const clampedSpeed = Math.min(speed, MAX_FALL_SPEED)

      const newTreat: FallingTreat = {
        id: treatIdRef.current++,
        x,
        y: -50,
        emoji: TREAT_EMOJIS[Math.floor(Math.random() * TREAT_EMOJIS.length)],
        speed: clampedSpeed,
        caught: false,
        missed: false,
      }

      setTreats(prev => [...prev, newTreat])
    }

    const spawnRate = Math.max(
      MIN_SPAWN_RATE,
      INITIAL_SPAWN_RATE - (difficultyRef.current - 1) * 100
    )

    const interval = setInterval(spawnTreat, spawnRate)
    return () => clearInterval(interval)
  }, [gameState])

  // Move treats
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = () => {
      const gameArea = gameAreaRef.current
      if (!gameArea) return

      const height = gameArea.clientHeight

      setTreats(prev => {
        const updated = prev.map(treat => {
          if (treat.caught || treat.missed) return treat

          const newY = treat.y + treat.speed

          // Check if treat hit bottom
          if (newY > height - 30) {
            // Miss - reset combo
            setCombo(0)
            onMiss()
            return { ...treat, y: newY, missed: true }
          }

          return { ...treat, y: newY }
        })

        // Remove off-screen treats
        return updated.filter(t => !t.missed || t.y < height + 100)
      })
    }

    const interval = setInterval(gameLoop, 16) // ~60fps
    return () => clearInterval(interval)
  }, [gameState, onMiss])

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('ended')
          return 0
        }

        // Increase difficulty every 5 seconds
        if (prev % 5 === 0) {
          difficultyRef.current = Math.min(6, difficultyRef.current + 1)
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Calculate final coins when game ends
  useEffect(() => {
    if (gameState === 'ended') {
      // Base: 2 coins per catch
      // Bonus: best combo * 2
      const baseCoins = score * 2
      const comboBonus = bestCombo * 2
      const total = baseCoins + comboBonus

      setCoinsEarned(total)
      addCoins(total)
      playMiniGame('catch', score, total)
    }
  }, [gameState, score, bestCombo, addCoins, playMiniGame])

  // Handle treat catch (tap/click)
  const handleCatchTreat = useCallback((treatId: number, x: number, y: number) => {
    setTreats(prev => prev.map(t =>
      t.id === treatId ? { ...t, caught: true } : t
    ))

    // Add sparkle effect
    const sparkleId = sparkleIdRef.current++
    setSparkles(prev => [...prev, { id: sparkleId, x, y }])
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => s.id !== sparkleId))
    }, 500)

    // Update score and combo with enhanced feedback
    setScore(prev => prev + 1)
    setCombo(prev => {
      const newCombo = prev + 1
      if (newCombo > bestCombo) {
        setBestCombo(newCombo)
      }

      // Point popup with varying messages
      const popupId = popupIdRef.current++
      let popupText = '+10'
      let popupColor = 'text-yellow-400'

      if (newCombo >= 15) {
        popupText = 'AMAZING! +50'
        popupColor = 'text-purple-400'
        setScreenShake(true)
        setTimeout(() => setScreenShake(false), 500)
      } else if (newCombo >= 10) {
        popupText = 'SUPER! +30'
        popupColor = 'text-pink-400'
        setScreenShake(true)
        setTimeout(() => setScreenShake(false), 300)
      } else if (newCombo >= 5) {
        popupText = 'COMBO! +20'
        popupColor = 'text-orange-400'
      } else if (newCombo >= 3) {
        popupText = '+15'
        popupColor = 'text-green-400'
        onCombo()
      }

      setPointPopups(prev => [...prev, { id: popupId, x, y, text: popupText, color: popupColor }])
      setTimeout(() => {
        setPointPopups(prev => prev.filter(p => p.id !== popupId))
      }, 1000)

      return newCombo
    })
    onCatch()

    // Remove treat after animation
    setTimeout(() => {
      setTreats(prev => prev.filter(t => t.id !== treatId))
    }, 300)
  }, [bestCombo, onCatch, onCombo])

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setCombo(0)
    setBestCombo(0)
    setTimeLeft(GAME_DURATION)
    setTreats([])
    setCoinsEarned(0)
    difficultyRef.current = 1
    treatIdRef.current = 0
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && gameState !== 'playing' && onClose()}
    >
      <div className="relative w-full h-full max-w-lg mx-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-600 to-red-600">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-white/70">Score</div>
              <div className="text-2xl font-bold text-white">{score}</div>
            </div>
            {combo >= 2 && (
              <div className="combo-badge px-3 py-1 bg-yellow-400 text-black font-bold rounded-full animate-pulse">
                {combo}x COMBO!
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-xs text-white/70">Time</div>
            <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-yellow-300 animate-pulse' : 'text-white'}`}>
              {timeLeft}s
            </div>
          </div>

          {gameState !== 'playing' && (
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white"
            >
              X
            </button>
          )}
        </div>

        {/* Game Area */}
        <div
          ref={gameAreaRef}
          className={`flex-1 relative overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-green-400 ${screenShake ? 'screen-shake' : ''}`}
        >
          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-green-600 to-green-500" />

          {/* Falling Treats */}
          {treats.map(treat => (
            <button
              key={treat.id}
              onClick={() => !treat.caught && !treat.missed && handleCatchTreat(treat.id, treat.x, treat.y)}
              className={`absolute w-12 h-12 flex items-center justify-center text-3xl
                         transition-transform touch-manipulation
                         ${treat.caught ? 'catch-animation' : ''}
                         ${treat.missed ? 'opacity-50' : 'hover:scale-110 active:scale-90'}`}
              style={{
                left: treat.x,
                top: treat.y,
                transform: treat.caught ? 'scale(1.5)' : 'scale(1)',
              }}
              disabled={treat.caught || treat.missed}
            >
              {treat.emoji}
            </button>
          ))}

          {/* Sparkle Effects */}
          {sparkles.map(sparkle => (
            <div
              key={sparkle.id}
              className="absolute pointer-events-none sparkle-burst"
              style={{ left: sparkle.x, top: sparkle.y }}
            >
              <span className="absolute -translate-x-2 -translate-y-4 text-xl sparkle-fly-1">*</span>
              <span className="absolute translate-x-2 -translate-y-4 text-xl sparkle-fly-2">*</span>
              <span className="absolute -translate-y-6 text-xl sparkle-fly-3">✨</span>
            </div>
          ))}

          {/* Point Popups */}
          {pointPopups.map(popup => (
            <div
              key={popup.id}
              className={`absolute pointer-events-none font-bold text-2xl ${popup.color} animate-bounce`}
              style={{
                left: popup.x,
                top: popup.y,
                animation: 'float 1s ease-out forwards',
                textShadow: '0 0 10px rgba(0,0,0,0.5), 0 0 20px currentColor'
              }}
            >
              {popup.text}
            </div>
          ))}

          {/* Ready Screen */}
          {gameState === 'ready' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
              <h2 className="text-4xl font-bold text-white mb-4">Treat Catcher!</h2>
              <p className="text-lg text-white/80 mb-2 text-center px-4">
                Tap the falling treats before they hit the ground!
              </p>
              <p className="text-sm text-yellow-300 mb-6">
                2 coins per catch + combo bonuses!
              </p>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600
                           rounded-2xl text-xl font-bold text-white shadow-lg
                           hover:scale-105 transition-transform btn-press"
              >
                START!
              </button>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState === 'ended' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 game-over-reveal">
              <h2 className="text-4xl font-bold text-white mb-6">Time's Up!</h2>

              <div className="bg-white/10 rounded-2xl p-6 mb-6 text-center">
                <div className="text-6xl mb-4">
                  {score >= 30 ? '!' : score >= 20 ? '!' : score >= 10 ? '!' : '!'}
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {score} Catches
                </div>
                <div className="text-lg text-yellow-300 mb-1">
                  Best Combo: {bestCombo}x
                </div>
                <div className="text-2xl font-bold text-yellow-400 mt-4">
                  +{coinsEarned} coins earned!
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600
                             rounded-xl font-bold text-white shadow-lg
                             hover:scale-105 transition-transform btn-press"
                >
                  Play Again
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-white/20 rounded-xl font-bold text-white
                             hover:bg-white/30 transition btn-press"
                >
                  Exit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
