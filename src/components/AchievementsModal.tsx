import { useEffect } from 'react'
import { useAchievementStore, ACHIEVEMENTS } from '../stores/achievementStore'
import type { Achievement, AchievementProgress } from '../stores/achievementStore'
import { useGameStore } from '../stores/gameStore'

interface AchievementsModalProps {
  onClose: () => void
}

export default function AchievementsModal({ onClose }: AchievementsModalProps) {
  const { initProgress, claimReward, getProgress } = useAchievementStore()
  const { addCoins } = useGameStore()

  // Initialize progress on mount
  useEffect(() => {
    initProgress()
  }, [initProgress])

  // BUG-023 fix: Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleClaim = (achievementId: string) => {
    const reward = claimReward(achievementId)
    if (reward > 0) {
      addCoins(reward)
    }
  }

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'collection': return 'Collection'
      case 'care': return 'Care'
      case 'progression': return 'Progression'
      case 'mastery': return 'Mastery'
      default: return category
    }
  }

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'collection': return 'from-blue-500 to-cyan-500'
      case 'care': return 'from-pink-500 to-rose-500'
      case 'progression': return 'from-purple-500 to-indigo-500'
      case 'mastery': return 'from-yellow-500 to-amber-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  // Group achievements by category
  const groupedAchievements = ACHIEVEMENTS.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = []
    }
    acc[achievement.category].push(achievement)
    return acc
  }, {} as Record<string, Achievement[]>)

  const categoryOrder = ['collection', 'care', 'progression', 'mastery']

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/80"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-6 w-full max-w-md max-h-[85vh] shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <span>🏆</span>
          <span>Achievements</span>
        </h2>

        {/* Achievements grid */}
        <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6">
          {categoryOrder.map(category => {
            const achievements = groupedAchievements[category] || []
            if (achievements.length === 0) return null

            return (
              <div key={category}>
                <h3 className={`text-sm font-bold mb-3 px-2 py-1 rounded-lg bg-gradient-to-r ${getCategoryColor(category)} inline-block`}>
                  {getCategoryLabel(category)}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map(achievement => {
                    const achievementProgress = getProgress(achievement.id)
                    return (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        progress={achievementProgress}
                        onClaim={() => handleClaim(achievement.id)}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-3 mt-4 text-gray-400 hover:text-white transition border-t border-gray-700 pt-4"
          aria-label="Close achievements"
        >
          Close
        </button>
      </div>
    </div>
  )
}

interface AchievementCardProps {
  achievement: Achievement
  progress: AchievementProgress | undefined
  onClaim: () => void
}

function AchievementCard({ achievement, progress, onClaim }: AchievementCardProps) {
  const isUnlocked = progress?.unlocked || false
  const isClaimed = progress?.claimed || false
  const current = progress?.current || 0
  const percentage = Math.min(100, (current / achievement.requirement) * 100)

  return (
    <div
      className={`relative p-3 rounded-xl transition-all ${
        isUnlocked
          ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/50'
          : 'bg-black/30 border border-gray-700'
      }`}
    >
      {/* Icon */}
      <div className={`text-3xl mb-2 ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
        {achievement.icon}
      </div>

      {/* Name */}
      <h4 className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
        {achievement.name}
      </h4>

      {/* Description */}
      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
        {achievement.description}
      </p>

      {/* Progress bar (if not unlocked) */}
      {!isUnlocked && (
        <div className="mt-2">
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-yellow-500 to-amber-500 h-1.5 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {current} / {achievement.requirement}
          </p>
        </div>
      )}

      {/* Reward / Claim button */}
      {isUnlocked && !isClaimed ? (
        <button
          onClick={onClaim}
          className="w-full mt-2 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-xs font-bold text-white btn-press hover:scale-105 transition-transform animate-pulse"
          aria-label={`Claim ${achievement.name} reward (${achievement.reward} coins)`}
        >
          Claim {achievement.reward} 💰
        </button>
      ) : isUnlocked && isClaimed ? (
        <div className="mt-2 py-1.5 text-center text-xs text-green-400 font-medium">
          ✓ Claimed
        </div>
      ) : (
        <div className="mt-2 py-1.5 text-center text-xs text-gray-500">
          +{achievement.reward} 💰
        </div>
      )}

      {/* Unlocked badge */}
      {isUnlocked && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-xs">✓</span>
        </div>
      )}
    </div>
  )
}
