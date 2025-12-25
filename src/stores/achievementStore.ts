import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeLocalStorage, showStorageError, isStorageAvailable, StorageError } from '../utils/storage'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  reward: number
  requirement: number
  category: 'collection' | 'care' | 'progression' | 'mastery'
}

export interface AchievementProgress {
  achievementId: string
  current: number
  unlocked: boolean
  unlockedAt: number | null
  claimed: boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  // Collection
  {
    id: 'first_friend',
    name: 'First Friend',
    description: 'Adopt your first pet',
    icon: '🐣',
    reward: 50,
    requirement: 1,
    category: 'collection',
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Own 5 pets',
    icon: '📦',
    reward: 100,
    requirement: 5,
    category: 'collection',
  },
  {
    id: 'rare_find',
    name: 'Rare Find',
    description: 'Get a rare pet',
    icon: '💎',
    reward: 150,
    requirement: 1,
    category: 'collection',
  },
  {
    id: 'legendary_hunter',
    name: 'Legendary Hunter',
    description: 'Get a legendary pet',
    icon: '🌟',
    reward: 500,
    requirement: 1,
    category: 'collection',
  },
  // Care
  {
    id: 'caring_soul',
    name: 'Caring Soul',
    description: 'Perform 100 care actions',
    icon: '💖',
    reward: 200,
    requirement: 100,
    category: 'care',
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Login 7 days in a row',
    icon: '📅',
    reward: 300,
    requirement: 7,
    category: 'care',
  },
  // Progression
  {
    id: 'evolver',
    name: 'Evolver',
    description: 'Evolve a pet',
    icon: '🦋',
    reward: 250,
    requirement: 1,
    category: 'progression',
  },
  {
    id: 'master',
    name: 'Master',
    description: 'Max level a pet (Level 50)',
    icon: '👑',
    reward: 1000,
    requirement: 1,
    category: 'progression',
  },
  // Mastery
  {
    id: 'gamer',
    name: 'Gamer',
    description: 'Win 10 mini-games',
    icon: '🎮',
    reward: 200,
    requirement: 10,
    category: 'mastery',
  },
  {
    id: 'wealthy',
    name: 'Wealthy',
    description: 'Have 5000 coins at once',
    icon: '💰',
    reward: 100,
    requirement: 5000,
    category: 'mastery',
  },
]

interface AchievementState {
  progress: AchievementProgress[]
  newUnlocks: string[] // Achievement IDs that were just unlocked (for notification)

  // Actions
  initProgress: () => void
  updateProgress: (achievementId: string, newValue: number) => void
  checkAndUnlock: (achievementId: string, currentValue: number) => boolean
  claimReward: (achievementId: string) => number
  getProgress: (achievementId: string) => AchievementProgress | undefined
  getUnclaimedCount: () => number
  clearNewUnlocks: () => void
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      progress: [],
      newUnlocks: [],

      initProgress: () => {
        const state = get()
        if (state.progress.length === 0) {
          const initialProgress: AchievementProgress[] = ACHIEVEMENTS.map(a => ({
            achievementId: a.id,
            current: 0,
            unlocked: false,
            unlockedAt: null,
            claimed: false,
          }))
          set({ progress: initialProgress })
        }
      },

      updateProgress: (achievementId, newValue) => {
        set((state) => ({
          progress: state.progress.map(p =>
            p.achievementId === achievementId
              ? { ...p, current: Math.max(p.current, newValue) }
              : p
          ),
        }))

        // Check if this unlocks the achievement
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
        if (achievement && newValue >= achievement.requirement) {
          get().checkAndUnlock(achievementId, newValue)
        }
      },

      checkAndUnlock: (achievementId, currentValue) => {
        const state = get()
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
        const progressItem = state.progress.find(p => p.achievementId === achievementId)

        if (!achievement || !progressItem) return false
        if (progressItem.unlocked) return false

        if (currentValue >= achievement.requirement) {
          set((state) => ({
            progress: state.progress.map(p =>
              p.achievementId === achievementId
                ? { ...p, current: currentValue, unlocked: true, unlockedAt: Date.now() }
                : p
            ),
            newUnlocks: [...state.newUnlocks, achievementId],
          }))
          return true
        }
        return false
      },

      claimReward: (achievementId) => {
        const state = get()
        const progressItem = state.progress.find(p => p.achievementId === achievementId)
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)

        if (!progressItem || !achievement) return 0
        if (!progressItem.unlocked || progressItem.claimed) return 0

        set((state) => ({
          progress: state.progress.map(p =>
            p.achievementId === achievementId
              ? { ...p, claimed: true }
              : p
          ),
        }))

        return achievement.reward
      },

      getProgress: (achievementId) => {
        return get().progress.find(p => p.achievementId === achievementId)
      },

      getUnclaimedCount: () => {
        return get().progress.filter(p => p.unlocked && !p.claimed).length
      },

      clearNewUnlocks: () => {
        set({ newUnlocks: [] })
      },
    }),
    {
      name: 'petplay-achievements',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try {
            return safeLocalStorage.getItem(name)
          } catch (error) {
            if (error instanceof StorageError) {
              showStorageError(error, 'achievementStore.getItem')
            }
            return null
          }
        },
        setItem: (name, value) => {
          try {
            safeLocalStorage.setItem(name, value)
          } catch (error) {
            if (error instanceof StorageError) {
              showStorageError(error, 'achievementStore.setItem')
            }
            // Don't throw - fail gracefully
          }
        },
        removeItem: (name) => {
          safeLocalStorage.removeItem(name)
        },
      })),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to load achievement data:', error)
          showStorageError(
            new StorageError('Achievement data could not be loaded', 'corrupted'),
            'achievementStore.rehydrate'
          )
          return
        }

        // Warn user if localStorage is unavailable
        if (!isStorageAvailable()) {
          console.warn('localStorage is not available - achievements will not be saved')
        } else if (state) {
          if (import.meta.env.DEV) console.log('Achievement data loaded successfully')
        }
      },
    }
  )
)
