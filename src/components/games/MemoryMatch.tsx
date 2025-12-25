import { useState, useEffect, useCallback, useRef } from 'react'
import { useGameStore, PET_SPECIES } from '../../stores/gameStore'

interface MemoryMatchProps {
  onClose: () => void
}

interface Card {
  id: number
  emoji: string
  speciesId: string
  isFlipped: boolean
  isMatched: boolean
}

const GAME_TIME = 60 // seconds
const GRID_SIZE = 16 // 4x4 grid

export default function MemoryMatch({ onClose }: MemoryMatchProps) {
  const { addCoins, playMiniGame } = useGameStore()
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'won' | 'lost'>('ready')
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matches, setMatches] = useState(0)
  const [moves, setMoves] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [coinsEarned, setCoinsEarned] = useState(0)
  const [celebration, setCelebration] = useState(false)

  const isCheckingRef = useRef(false)
  const totalPairs = GRID_SIZE / 2

  // Sound hooks - ready for future implementation
  const onFlip = useCallback(() => {
    // Sound hook: play flip sound
  }, [])

  const onMatch = useCallback(() => {
    // Sound hook: play match sound
  }, [])

  const onMismatch = useCallback(() => {
    // Sound hook: play mismatch sound
  }, [])

  const onVictory = useCallback(() => {
    // Sound hook: play victory sound
  }, [])

  // Initialize cards
  const initializeCards = useCallback(() => {
    // Select random pet species for the game
    const shuffledSpecies = [...PET_SPECIES]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalPairs)

    // Create pairs
    const cardPairs: Card[] = []
    shuffledSpecies.forEach((species, index) => {
      // Create two cards for each species
      cardPairs.push({
        id: index * 2,
        emoji: species.emoji,
        speciesId: species.id,
        isFlipped: false,
        isMatched: false,
      })
      cardPairs.push({
        id: index * 2 + 1,
        emoji: species.emoji,
        speciesId: species.id,
        isFlipped: false,
        isMatched: false,
      })
    })

    // Shuffle cards
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5)
    setCards(shuffledCards)
  }, [totalPairs])

  // Start game
  const startGame = () => {
    initializeCards()
    setGameState('playing')
    setFlippedCards([])
    setMatches(0)
    setMoves(0)
    setTimeLeft(GAME_TIME)
    setCoinsEarned(0)
    setCelebration(false)
    isCheckingRef.current = false
  }

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('lost')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Check for win
  useEffect(() => {
    if (gameState === 'playing' && matches === totalPairs) {
      setCelebration(true)
      onVictory()

      // Calculate coins: base + time bonus + efficiency bonus
      const baseCoins = matches * 5 // 5 coins per match
      const timeBonus = Math.floor(timeLeft / 5) * 2 // 2 coins per 5 seconds remaining
      const efficiencyBonus = moves <= totalPairs * 2 ? 20 : moves <= totalPairs * 3 ? 10 : 0
      const total = baseCoins + timeBonus + efficiencyBonus

      setTimeout(() => {
        setCoinsEarned(total)
        addCoins(total)
        playMiniGame('memory', matches, total)
        setGameState('won')
      }, 1500)
    }
  }, [matches, totalPairs, gameState, timeLeft, moves, addCoins, playMiniGame, onVictory])

  // Handle card flip
  const handleCardClick = useCallback((cardId: number) => {
    if (gameState !== 'playing') return
    if (isCheckingRef.current) return

    const card = cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return

    onFlip()

    // Flip the card
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    ))

    const newFlipped = [...flippedCards, cardId]
    setFlippedCards(newFlipped)

    // Check for match if two cards are flipped
    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1)
      isCheckingRef.current = true

      const [firstId, secondId] = newFlipped
      const firstCard = cards.find(c => c.id === firstId)
      const secondCard = cards.find(c => c.id === secondId)

      if (firstCard && secondCard && firstCard.speciesId === secondCard.speciesId) {
        // Match found!
        onMatch()
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.speciesId === firstCard.speciesId
              ? { ...c, isMatched: true }
              : c
          ))
          setMatches(prev => prev + 1)
          setFlippedCards([])
          isCheckingRef.current = false
        }, 500)
      } else {
        // No match - flip back
        onMismatch()
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            newFlipped.includes(c.id) && !c.isMatched
              ? { ...c, isFlipped: false }
              : c
          ))
          setFlippedCards([])
          isCheckingRef.current = false
        }, 1000)
      }
    }
  }, [cards, flippedCards, gameState, onFlip, onMatch, onMismatch])

  // Calculate coins for lost game
  useEffect(() => {
    if (gameState === 'lost') {
      // Partial reward for matches found
      const partialCoins = matches * 3
      setCoinsEarned(partialCoins)
      if (partialCoins > 0) {
        addCoins(partialCoins)
        playMiniGame('memory', matches, partialCoins)
      }
    }
  }, [gameState, matches, addCoins, playMiniGame])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && gameState !== 'playing' && onClose()}
    >
      <div className="relative w-full h-full max-w-lg mx-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-white/70">Matches</div>
              <div className="text-2xl font-bold text-white">{matches}/{totalPairs}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/70">Moves</div>
              <div className="text-xl font-bold text-white">{moves}</div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-white/70">Time</div>
            <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-yellow-300 animate-pulse' : 'text-white'}`}>
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
        <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-indigo-900 to-purple-900">
          {gameState === 'ready' && (
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Memory Match!</h2>
              <p className="text-lg text-white/80 mb-2">
                Find all matching pet pairs!
              </p>
              <p className="text-sm text-yellow-300 mb-6">
                Faster = More coins! Efficiency bonus for fewer moves!
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

          {(gameState === 'playing' || celebration) && (
            <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
              {cards.map(card => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isFlipped || card.isMatched || isCheckingRef.current}
                  className={`aspect-square rounded-xl text-3xl flex items-center justify-center
                             transition-all duration-300 transform-gpu btn-press touch-manipulation
                             ${card.isMatched
                               ? 'bg-green-500/50 scale-95 matched-card'
                               : card.isFlipped
                                 ? 'bg-white card-flip-front'
                                 : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:scale-105 card-back'
                             }`}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {(card.isFlipped || card.isMatched) ? (
                    <span className={card.isMatched ? 'opacity-70' : ''}>
                      {card.emoji}
                    </span>
                  ) : (
                    <span className="text-2xl">?</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Victory celebration overlay */}
          {celebration && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="celebration-burst">
                {[...Array(12)].map((_, i) => (
                  <span
                    key={i}
                    className="absolute text-3xl celebration-particle"
                    style={{
                      '--angle': `${i * 30}deg`,
                      animationDelay: `${i * 50}ms`,
                    } as React.CSSProperties}
                  >
                    {['*', '!', '*', '!', '*', '!'][i % 6]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Won Screen */}
          {gameState === 'won' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 game-over-reveal">
              <h2 className="text-4xl font-bold text-white mb-6">You Win!</h2>

              <div className="bg-white/10 rounded-2xl p-6 mb-6 text-center">
                <div className="text-6xl mb-4">!</div>
                <div className="text-2xl font-bold text-white mb-2">
                  All Pairs Found!
                </div>
                <div className="text-lg text-white/80 mb-1">
                  Moves: {moves} | Time: {GAME_TIME - timeLeft}s
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

          {/* Lost Screen */}
          {gameState === 'lost' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 game-over-reveal">
              <h2 className="text-4xl font-bold text-white mb-6">Time's Up!</h2>

              <div className="bg-white/10 rounded-2xl p-6 mb-6 text-center">
                <div className="text-6xl mb-4">...</div>
                <div className="text-2xl font-bold text-white mb-2">
                  {matches}/{totalPairs} Pairs Found
                </div>
                <div className="text-lg text-white/80 mb-1">
                  Moves: {moves}
                </div>
                {coinsEarned > 0 && (
                  <div className="text-xl font-bold text-yellow-400 mt-4">
                    +{coinsEarned} coins for partial progress!
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600
                             rounded-xl font-bold text-white shadow-lg
                             hover:scale-105 transition-transform btn-press"
                >
                  Try Again
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
