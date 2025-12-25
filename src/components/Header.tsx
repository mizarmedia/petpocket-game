import { useState, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import { useAchievementStore } from '../stores/achievementStore'
import { playSound, haptic } from '../utils/feedback'

interface HeaderProps {
  onOpenCollection: () => void
  onOpenGames: () => void
  onOpenAchievements?: () => void
}

export default function Header({ onOpenCollection, onOpenGames, onOpenAchievements }: HeaderProps) {
  const { coins, pets } = useGameStore()
  const { getUnclaimedCount } = useAchievementStore()
  const [coinChange, setCoinChange] = useState(0)
  const [prevCoins, setPrevCoins] = useState(coins)

  // Animate coin changes and play sound
  useEffect(() => {
    if (coins !== prevCoins) {
      const change = coins - prevCoins
      setCoinChange(change)
      setPrevCoins(coins)

      // Play coin sound for positive changes
      if (change > 0) {
        playSound('coin')
        haptic('light')
      }

      // Reset animation after it plays
      const timer = setTimeout(() => setCoinChange(0), 1000)
      return () => clearTimeout(timer)
    }
  }, [coins, prevCoins])

  return (
    <header className="glass relative z-10 mx-2 mt-2 rounded-2xl">
      <div className="flex items-center justify-between p-3 px-4">
        {/* Coins Display */}
        <div className="flex items-center gap-2 relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600
                          flex items-center justify-center shadow-lg
                          border-2 border-yellow-300/50">
            <span className="text-xl animate-pulse-scale">💰</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-yellow-400 tabular-nums tracking-wide">
              {coins.toLocaleString()}
            </span>
            <span className="text-[10px] text-yellow-400/60 uppercase tracking-wider">Coins</span>
          </div>

          {/* Coin change animation */}
          {coinChange !== 0 && (
            <span
              className={`absolute -top-2 right-0 text-sm font-bold
                         ${coinChange > 0 ? 'text-green-400' : 'text-red-400'}
                         animate-bounce`}
              style={{
                animation: 'float 1s ease-out forwards',
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
              {coinChange > 0 ? '+' : ''}{coinChange}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400
                          bg-clip-text text-transparent
                          drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">
            PetPocket
          </span>
        </h1>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Achievements Button */}
          {onOpenAchievements && (
            <button
              onClick={() => {
                playSound('tap')
                haptic('light')
                onOpenAchievements()
              }}
              className="relative p-2.5 min-w-11 min-h-11 rounded-xl glass hover:bg-white/15
                         transition-all duration-200 btn-press hover-scale
                         group touch-manipulation"
              title="Achievements"
              aria-label={`View achievements${getUnclaimedCount() > 0 ? ` (${getUnclaimedCount()} unclaimed)` : ''}`}
            >
              <span className="text-2xl group-hover:animate-bounce block">🏆</span>

              {/* Unclaimed badge */}
              {getUnclaimedCount() > 0 && (
                <span className="absolute -top-1.5 -right-1.5
                                bg-gradient-to-br from-green-500 to-emerald-600
                                text-[11px] font-bold rounded-full
                                min-w-[22px] h-[22px]
                                flex items-center justify-center
                                border-2 border-white/20
                                shadow-lg shadow-green-500/30
                                animate-pulse">
                  {getUnclaimedCount()}
                </span>
              )}
            </button>
          )}

          {/* Games Button */}
          <button
            onClick={() => {
              playSound('tap')
              haptic('light')
              onOpenGames()
            }}
            className="relative p-2.5 min-w-11 min-h-11 rounded-xl glass hover:bg-white/15
                       transition-all duration-200 btn-press hover-scale
                       group touch-manipulation"
            title="Mini Games"
            aria-label="Play mini games"
          >
            <span className="text-2xl group-hover:animate-bounce block">🎮</span>
          </button>

          {/* Collection Button */}
          <button
            onClick={() => {
              playSound('tap')
              haptic('light')
              onOpenCollection()
            }}
            className="relative p-2.5 min-w-11 min-h-11 rounded-xl glass hover:bg-white/15
                       transition-all duration-200 btn-press hover-scale
                       group touch-manipulation"
            title="Collection"
            aria-label={`View collection (${pets.length} pets)`}
          >
            <span className="text-2xl group-hover:animate-bounce block">📦</span>

            {/* Pet count badge */}
            <span className="absolute -top-1.5 -right-1.5
                            bg-gradient-to-br from-pink-500 to-purple-600
                            text-[11px] font-bold rounded-full
                            min-w-[22px] h-[22px]
                            flex items-center justify-center
                            border-2 border-white/20
                            shadow-lg shadow-pink-500/30">
              {pets.length}
            </span>
          </button>
        </div>
      </div>

      {/* Subtle gradient line at bottom */}
      <div className="absolute bottom-0 left-4 right-4 h-[1px]
                      bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </header>
  )
}
