import { useState, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import { useAchievementStore } from '../stores/achievementStore'
import { playSound, haptic } from '../utils/feedback'

// SVG Icons for header
const CoinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <circle cx="12" cy="12" r="10" fill="url(#coinGradient)" stroke="#fcd34d" strokeWidth="1.5"/>
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#92400e">$</text>
    <defs>
      <linearGradient id="coinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fde047"/>
        <stop offset="100%" stopColor="#f59e0b"/>
      </linearGradient>
    </defs>
  </svg>
)

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" className="text-yellow-400">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
  </svg>
)

const GamepadIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" className="text-purple-400">
    <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
  </svg>
)

const CollectionIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" className="text-pink-400">
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>
  </svg>
)

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
            <CoinIcon />
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
              <TrophyIcon />

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
            <GamepadIcon />
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
            <CollectionIcon />

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
