import { useEffect, useState, useRef } from 'react'
import { useGameStore, PET_SPECIES } from './stores/gameStore'
import { useAchievementStore } from './stores/achievementStore'
import PetDisplay from './components/PetDisplay'
import StatBars from './components/StatBars'
import ActionButtons from './components/ActionButtons'
import Header from './components/Header'
import GachaModal from './components/GachaModal'
import CollectionModal from './components/CollectionModal'
import StarterPicker from './components/StarterPicker'
import Snowflakes from './components/Snowflakes'
import GamesMenu from './components/games/GamesMenu'
import EvolutionModal from './components/EvolutionModal'
import AchievementsModal from './components/AchievementsModal'
import DailyRewardModal from './components/DailyRewardModal'
import { ToastProvider, useToast } from './components/Toast'
import { playSound, haptic } from './utils/feedback'

function AppContent() {
  const { pets, activePetId, updatePetStats, lastStreakClaim, totalCareActions, coins, evolutionHistory, miniGameWins, _hasHydrated } = useGameStore()
  const initProgress = useAchievementStore((state) => state.initProgress)
  const updateProgress = useAchievementStore((state) => state.updateProgress)
  const [showGacha, setShowGacha] = useState(false)
  const [showCollection, setShowCollection] = useState(false)
  const [showGames, setShowGames] = useState(false)
  const [showEvolution, setShowEvolution] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showDailyReward, setShowDailyReward] = useState(false)
  const hasCheckedDailyBonusRef = useRef(false)
  const hasInitializedAchievementsRef = useRef(false)
  useToast() // Keep hook active for toast context

  // CRITICAL FIX: Failsafe for _hasHydrated in case onRehydrateStorage doesn't fire
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!useGameStore.getState()._hasHydrated) {
        console.warn('Hydration timeout - forcing _hasHydrated to true')
        useGameStore.setState({ _hasHydrated: true })
      }
    }, 100) // 100ms failsafe
    return () => clearTimeout(timeout)
  }, [])

  // Update stats on mount and periodically
  useEffect(() => {
    updatePetStats()
    const interval = setInterval(updatePetStats, 60000) // Every minute
    return () => clearInterval(interval)
  }, [updatePetStats])

  // Check if daily reward is available on first load
  useEffect(() => {
    if (hasCheckedDailyBonusRef.current) return
    if (!_hasHydrated) return
    hasCheckedDailyBonusRef.current = true

    // Check if user can claim daily reward (hasn't claimed today)
    const oneDayMs = 24 * 60 * 60 * 1000
    const now = Date.now()
    const canClaim = !lastStreakClaim || (now - lastStreakClaim >= oneDayMs)

    if (canClaim && pets.length > 0) {
      // Show daily reward modal after a short delay
      setTimeout(() => {
        setShowDailyReward(true)
        playSound('tap')
        haptic('light')
      }, 800)
    }
  }, [lastStreakClaim, pets.length, _hasHydrated])

  // Initialize achievements and track progress
  useEffect(() => {
    if (hasInitializedAchievementsRef.current) return
    hasInitializedAchievementsRef.current = true
    initProgress()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - initProgress is stable but selector creates new ref

  // Track achievements based on game state
  useEffect(() => {
    // First Friend - adopt first pet
    if (pets.length >= 1) {
      updateProgress('first_friend', 1)
    }
    // Collector - own 5 pets
    updateProgress('collector', pets.length)

    // Rare Find - check if any pet is rare (rarity 3+)
    const hasRare = pets.some(p => {
      const species = PET_SPECIES.find(s => s.id === p.speciesId)
      return species && species.rarity >= 3
    })
    if (hasRare) updateProgress('rare_find', 1)

    // Legendary Hunter - check if any pet is legendary
    const hasLegendary = pets.some(p => {
      const species = PET_SPECIES.find(s => s.id === p.speciesId)
      return species && species.rarity === 5
    })
    if (hasLegendary) updateProgress('legendary_hunter', 1)

    // Master - check if any pet is max level
    const hasMaxLevel = pets.some(p => p.level >= 50)
    if (hasMaxLevel) updateProgress('master', 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pets]) // Removed updateProgress - stable but selector creates new ref

  // Track care actions
  useEffect(() => {
    updateProgress('caring_soul', totalCareActions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCareActions]) // Removed updateProgress - stable but selector creates new ref

  // Track coins for wealthy achievement
  useEffect(() => {
    if (coins >= 5000) {
      updateProgress('wealthy', coins)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coins]) // Removed updateProgress - stable but selector creates new ref

  // Track evolutions
  useEffect(() => {
    if (evolutionHistory.length > 0) {
      updateProgress('evolver', evolutionHistory.length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evolutionHistory]) // Removed updateProgress - stable but selector creates new ref

  // Track mini-game wins
  useEffect(() => {
    updateProgress('gamer', miniGameWins)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [miniGameWins]) // Removed updateProgress - stable but selector creates new ref

  // LOW-002 fix: Wait for hydration before showing starter picker
  if (!_hasHydrated) {
    return (
      <>
        <Snowflakes />
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </>
    )
  }

  // If no pets, show starter picker
  if (pets.length === 0) {
    return (
      <>
        <Snowflakes />
        <StarterPicker />
      </>
    )
  }

  const activePet = pets.find(p => p.id === activePetId)
  const activeSpecies = activePet ? PET_SPECIES.find(s => s.id === activePet.speciesId) : null

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto relative overflow-hidden">
      <Snowflakes />

      {/* Header */}
      <Header
        onOpenCollection={() => setShowCollection(true)}
        onOpenGames={() => setShowGames(true)}
        onOpenAchievements={() => setShowAchievements(true)}
      />

      {/* Main Pet Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {activePet && activeSpecies && (
          <PetDisplay
            pet={activePet}
            species={activeSpecies}
            onEvolutionClick={() => setShowEvolution(true)}
          />
        )}
      </div>

      {/* Stats */}
      <div className="pb-2">
        {activePet && <StatBars stats={activePet.stats} />}
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4">
        <ActionButtons />
      </div>

      {/* Gacha Button */}
      <div className="px-4 pb-6">
        <button
          onClick={() => {
            playSound('tap')
            haptic('medium')
            setShowGacha(true)
          }}
          aria-label="Hatch new pet for 100 coins"
          className="w-full py-4 rounded-2xl text-xl font-bold text-white
                     btn-3d relative overflow-hidden
                     hover:scale-[1.02] transition-transform"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500
                         bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />

          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/50 to-amber-500/50
                         blur-xl opacity-50" />

          {/* Content */}
          <span className="relative z-10 flex items-center justify-center gap-3">
            <span className="text-2xl">🥚</span>
            <span>HATCH NEW PET</span>
            <span className="text-sm opacity-80 bg-black/20 px-2 py-0.5 rounded-full">100 💰</span>
          </span>
        </button>
      </div>

      {/* Modals */}
      {showGacha && <GachaModal onClose={() => setShowGacha(false)} />}
      {showCollection && <CollectionModal onClose={() => setShowCollection(false)} />}
      {showGames && <GamesMenu onClose={() => setShowGames(false)} />}
      {showEvolution && activePet && activeSpecies && (
        <EvolutionModal
          pet={activePet}
          species={activeSpecies}
          onClose={() => setShowEvolution(false)}
          onEvolutionComplete={() => {
            updateProgress('evolver', (evolutionHistory?.length || 0) + 1)
          }}
        />
      )}
      {showAchievements && (
        <AchievementsModal onClose={() => setShowAchievements(false)} />
      )}
      {showDailyReward && (
        <DailyRewardModal onClose={() => setShowDailyReward(false)} />
      )}
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

export default App
