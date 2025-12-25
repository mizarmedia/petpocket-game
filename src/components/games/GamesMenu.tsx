import { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import CatchGame from './CatchGame'
import MemoryMatch from './MemoryMatch'

interface GamesMenuProps {
  onClose: () => void
}

type GameId = 'catch' | 'memory' | null

interface GameInfo {
  id: 'catch' | 'memory'
  name: string
  emoji: string
  description: string
  rewards: string
  color: string
}

const GAMES: GameInfo[] = [
  {
    id: 'catch',
    name: 'Treat Catcher',
    emoji: '🍖',
    description: 'Tap falling treats before they hit the ground! Build combos for bonus coins.',
    rewards: '2 coins/catch + combo bonus',
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'memory',
    name: 'Memory Match',
    emoji: '🧠',
    description: 'Find matching pet pairs! Race against the clock for the best score.',
    rewards: '5 coins/match + time & efficiency bonus',
    color: 'from-purple-500 to-pink-600',
  },
]

export default function GamesMenu({ onClose }: GamesMenuProps) {
  const { miniGameScores } = useGameStore()
  const [activeGame, setActiveGame] = useState<GameId>(null)

  const handlePlayGame = (gameId: 'catch' | 'memory') => {
    setActiveGame(gameId)
  }

  const handleGameClose = () => {
    setActiveGame(null)
  }

  // If a game is active, show only that game
  if (activeGame === 'catch') {
    return <CatchGame onClose={handleGameClose} />
  }

  if (activeGame === 'memory') {
    return <MemoryMatch onClose={handleGameClose} />
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/70"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            Mini Games
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition"
            aria-label="Close games menu"
          >
            X
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-6 text-center">
          Play games to earn coins for your pets!
        </p>

        <div className="space-y-4">
          {GAMES.map(game => {
            const highScore = miniGameScores[game.id]?.highScore || 0
            const totalCoins = miniGameScores[game.id]?.totalCoinsEarned || 0

            return (
              <div
                key={game.id}
                className="bg-black/30 rounded-2xl p-4 border border-white/10"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${game.color}
                                  flex items-center justify-center text-3xl flex-shrink-0`}>
                    {game.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1">{game.name}</h3>
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                      {game.description}
                    </p>
                    <p className="text-xs text-yellow-400">
                      {game.rewards}
                    </p>

                    {highScore > 0 && (
                      <div className="flex gap-3 mt-2 text-xs text-gray-500">
                        <span>Best: {highScore}</span>
                        <span>Total: {totalCoins} coins</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handlePlayGame(game.id)}
                  className={`w-full mt-3 py-3 bg-gradient-to-r ${game.color}
                             rounded-xl font-bold text-white shadow-lg
                             hover:scale-[1.02] transition-transform btn-press`}
                  aria-label={`Play ${game.name} game`}
                >
                  PLAY
                </button>
              </div>
            )
          })}
        </div>

        {/* Coming Soon Teaser */}
        <div className="mt-4 p-3 bg-white/5 rounded-xl border border-dashed border-white/20 text-center">
          <span className="text-gray-500 text-sm">More games coming soon...</span>
        </div>
      </div>
    </div>
  )
}
