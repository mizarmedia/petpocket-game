import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { getXpForLevel, MAX_LEVEL, useGameStore } from '../stores/gameStore'
import type { Pet, PetSpecies, EvolutionStage } from '../stores/gameStore'
import PetSprite, { getPetMood, type PetMood } from './pets/PetSprite'
import ParallaxStage from './ParallaxStage'
import { haptic } from '../utils/feedback'

interface PetDisplayProps {
  pet: Pet
  species: PetSpecies
  isFeeding?: boolean
  isPlaying?: boolean
  isCleaning?: boolean
  isSleeping?: boolean
  onEvolutionClick?: () => void
}

// Map species IDs that have custom sprites
const SPRITE_SPECIES = ['blob', 'fox', 'dragon', 'spirit', 'cosmic', 'reindeer']

interface HeartParticle {
  id: number
  x: number
  y: number
}

export default function PetDisplay({
  pet,
  species,
  isFeeding = false,
  isPlaying = false,
  isCleaning = false,
  isSleeping = false,
  onEvolutionClick
}: PetDisplayProps) {
  const { canEvolve } = useGameStore()
  const [isAnimating, setIsAnimating] = useState(false)
  const [actionMood, setActionMood] = useState<PetMood | null>(null)
  const [heartParticles, setHeartParticles] = useState<HeartParticle[]>([])
  const [petCooldown, setPetCooldown] = useState(false)
  const [isPetting, setIsPetting] = useState(false)
  const prevStatsRef = useRef(pet.stats)
  const heartIdRef = useRef(0)

  // Determine base emotion based on stats - using useMemo instead of useEffect+setState
  const baseEmotion = useMemo(() => {
    return getPetMood(pet.stats)
  }, [pet.stats])

  // Legacy emotion mapping for emoji pets
  const emotion = useMemo(() => {
    const { hunger, happiness, energy, cleanliness } = pet.stats
    const avgStat = (hunger + happiness + energy + cleanliness) / 4

    if (avgStat > 80) return 'happy'
    if (energy < 30) return 'sleepy'
    if (avgStat < 40) return 'sad'
    return 'normal'
  }, [pet.stats])

  // Handle action-triggered moods
  useEffect(() => {
    if (isFeeding) {
      setActionMood('eating')
      const timer = setTimeout(() => setActionMood(null), 1500)
      return () => clearTimeout(timer)
    }
    if (isPlaying) {
      setActionMood('happy')
      const timer = setTimeout(() => setActionMood(null), 1500)
      return () => clearTimeout(timer)
    }
    if (isCleaning) {
      setActionMood('happy')
      const timer = setTimeout(() => setActionMood(null), 1500)
      return () => clearTimeout(timer)
    }
    if (isSleeping) {
      setActionMood('sleeping')
      const timer = setTimeout(() => setActionMood(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [isFeeding, isPlaying, isCleaning, isSleeping])

  // Trigger animation and detect actions when stats change
  useEffect(() => {
    const prev = prevStatsRef.current
    const curr = pet.stats

    // MEDIUM-003 fix: Only trigger animation if stat changed meaningfully (>1 point)
    const ANIMATION_THRESHOLD = 1
    const hungerDiff = Math.abs(curr.hunger - prev.hunger)
    const happinessDiff = Math.abs(curr.happiness - prev.happiness)
    const energyDiff = Math.abs(curr.energy - prev.energy)
    const cleanlinessDiff = Math.abs(curr.cleanliness - prev.cleanliness)

    // Check which stat increased to determine action type
    const hungerIncreased = curr.hunger > prev.hunger
    const happinessIncreased = curr.happiness > prev.happiness
    const energyIncreased = curr.energy > prev.energy
    const cleanlinessIncreased = curr.cleanliness > prev.cleanliness

    // Only trigger animation if change is meaningful
    const hasMeaningfulChange = hungerDiff > ANIMATION_THRESHOLD ||
                                happinessDiff > ANIMATION_THRESHOLD ||
                                energyDiff > ANIMATION_THRESHOLD ||
                                cleanlinessDiff > ANIMATION_THRESHOLD

    if (hasMeaningfulChange) {
      setIsAnimating(true)

      // Auto-detect action based on which stat increased
      if (hungerIncreased && !isFeeding) {
        setActionMood('eating')
        const moodTimer = setTimeout(() => setActionMood(null), 1500)
        setTimeout(() => clearTimeout(moodTimer), 1500)
      } else if (energyIncreased && !isSleeping) {
        setActionMood('sleeping')
        const moodTimer = setTimeout(() => setActionMood(null), 1500)
        setTimeout(() => clearTimeout(moodTimer), 1500)
      } else if ((happinessIncreased || cleanlinessIncreased) && !isPlaying && !isCleaning) {
        setActionMood('happy')
        const moodTimer = setTimeout(() => setActionMood(null), 1500)
        setTimeout(() => clearTimeout(moodTimer), 1500)
      }

      const timer = setTimeout(() => setIsAnimating(false), 500)
      prevStatsRef.current = curr
      return () => clearTimeout(timer)
    }
  }, [pet.stats, isFeeding, isPlaying, isCleaning, isSleeping])

  // Get the effective mood (action overrides base mood)
  const effectiveMood = actionMood || baseEmotion

  const getEmotionEmoji = () => {
    switch (emotion) {
      case 'happy': return ''
      case 'sad': return ''
      case 'sleepy': return ''
      default: return ''
    }
  }

  const getRarityStars = () => {
    return '*'.repeat(species.rarity)
  }

  const getRarityClass = () => {
    switch (species.rarity) {
      case 1: return 'text-gray-400'
      case 2: return 'text-green-400'
      case 3: return 'text-blue-400'
      case 4: return 'text-purple-400'
      case 5: return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  // FEAT-002: Pet tap interaction handler
  const handlePetTap = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (petCooldown) return

    // Haptic feedback
    haptic('light')

    // Create heart particles
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    const newHearts: HeartParticle[] = []
    for (let i = 0; i < 5; i++) {
      newHearts.push({
        id: heartIdRef.current++,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
      })
    }

    setHeartParticles(prev => [...prev, ...newHearts])
    setTimeout(() => {
      setHeartParticles(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)))
    }, 1000)

    // Trigger happy animation
    setIsPetting(true)
    setActionMood('happy')
    setTimeout(() => {
      setIsPetting(false)
      setActionMood(null)
    }, 800)

    // Small happiness boost (+2) - directly update via Zustand
    useGameStore.setState((state) => ({
      pets: state.pets.map(p =>
        p.id === pet.id
          ? { ...p, stats: { ...p.stats, happiness: Math.min(100, p.stats.happiness + 2) }, lastUpdated: Date.now() }
          : p
      )
    }))

    // 30s cooldown
    setPetCooldown(true)
    setTimeout(() => setPetCooldown(false), 30000)
  }, [petCooldown, pet.id])

  const isThriving = Object.values(pet.stats).every(s => s > 80)
  const hasCustomSprite = SPRITE_SPECIES.includes(species.id)
  const canEvolveNow = canEvolve(pet.id)

  // XP progress calculation
  const xpForCurrentLevel = getXpForLevel(pet.level)
  const xpPercentage = pet.level >= MAX_LEVEL ? 100 : (pet.xp / xpForCurrentLevel) * 100

  // Evolution stage helpers
  const getEvolutionStageName = (stage: EvolutionStage): string => {
    switch (stage) {
      case 1: return 'Baby'
      case 2: return 'Teen'
      case 3: return 'Adult'
    }
  }

  // Memoize style objects to prevent recreation on every render (MEDIUM-002 fix)
  const rareGlowStyle = useMemo(() => ({
    background: `radial-gradient(circle, ${species.color} 0%, transparent 60%)`,
    filter: `blur(20px)`
  }), [species.color])

  const epicGlowStyle = useMemo(() => ({
    background: `radial-gradient(circle, ${species.color} 0%, transparent 60%)`,
    filter: `blur(20px)`,
    animation: 'pulseSoft 2s ease-in-out infinite'
  }), [species.color])

  const thrivingGlowStyle = useMemo(() => ({
    background: `radial-gradient(circle, ${species.color} 0%, transparent 70%)`
  }), [species.color])

  const spriteStyle = useMemo(() => ({
    filter: isThriving ? `drop-shadow(0 0 20px ${species.color})` : 'none',
    transform: isAnimating ? 'scale(1.1)' : 'scale(1)'
  }), [isThriving, species.color, isAnimating])

  const emojiFilterStyle = useMemo(() => ({
    filter: isThriving ? `drop-shadow(0 0 20px ${species.color})` : 'none'
  }), [isThriving, species.color])

  const legendaryGlowStyle = useMemo(() => ({
    background: `
      radial-gradient(circle at 50% 50%,
        rgba(255, 215, 0, 0.3) 0%,
        rgba(255, 105, 180, 0.2) 25%,
        rgba(138, 43, 226, 0.2) 50%,
        rgba(0, 191, 255, 0.2) 75%,
        transparent 100%
      )
    `,
    filter: `blur(25px)`,
    animation: 'shimmer 2s ease-in-out infinite'
  }), [])

  return (
    <div className="relative flex flex-col items-center">
      {/* Pet name and level */}
      <div className="mb-4 text-center relative z-20">
        <h2 className="text-2xl font-bold text-white mb-1">{pet.name}</h2>
        <div className="flex items-center justify-center gap-2">
          <span className={`text-sm font-bold ${getRarityClass()}`}>
            {getRarityStars()}
          </span>
          <span className="text-sm text-gray-400">Lv.{pet.level}</span>
          <span className="text-xs px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded-full">
            {getEvolutionStageName(pet.evolutionStage || 1)}
          </span>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-2 w-40 mx-auto">
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {pet.level >= MAX_LEVEL ? 'MAX LEVEL' : `${pet.xp} / ${xpForCurrentLevel} XP`}
          </p>
        </div>
      </div>

      {/* Pet container with parallax stage */}
      <ParallaxStage petMood={effectiveMood} className="w-full h-64 rounded-2xl mb-4">
        <div
          onClick={handlePetTap}
          className={`relative w-48 h-48 flex items-center justify-center cursor-pointer
                      ${isPetting ? 'pet-happy' : ''}
                      ${isAnimating && !hasCustomSprite ? 'pet-happy' : hasCustomSprite ? '' : 'pet-bounce'}
                      ${petCooldown ? 'opacity-90' : 'hover:scale-105 transition-transform'}`}
          style={{ color: species.color }}
        >
        {/* Rarity-based visual effects */}
        {species.rarity >= 2 && (
          <>
            {/* Uncommon: Sparkles */}
            {species.rarity === 2 && (
              <>
                <span className="absolute top-4 left-8 text-xl animate-ping" style={{ animationDuration: '2s' }}>*</span>
                <span className="absolute bottom-6 right-10 text-lg animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }}>*</span>
              </>
            )}

            {/* Rare: Glow aura */}
            {species.rarity === 3 && (
              <div
                className="absolute inset-0 rounded-full opacity-40 animate-pulse"
                style={rareGlowStyle}
              />
            )}

            {/* Epic: Floating particles */}
            {species.rarity === 4 && (
              <>
                <div
                  className="absolute inset-0 rounded-full opacity-50"
                  style={epicGlowStyle}
                />
                <span className="absolute top-2 left-6 text-2xl" style={{ animation: 'float 3s ease-in-out infinite' }}>*</span>
                <span className="absolute top-8 right-4 text-xl" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '1s' }}>✨</span>
                <span className="absolute bottom-4 left-10 text-xl" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '2s' }}>*</span>
              </>
            )}

            {/* Legendary: Rainbow shimmer */}
            {species.rarity >= 5 && (
              <>
                <div
                  className="absolute inset-0 rounded-full opacity-60"
                  style={legendaryGlowStyle}
                />
                <span className="absolute top-1 left-4 text-2xl text-yellow-400" style={{ animation: 'float 2.5s ease-in-out infinite', textShadow: '0 0 10px #ffd700' }}>✨</span>
                <span className="absolute top-6 right-2 text-xl text-pink-400" style={{ animation: 'float 2.5s ease-in-out infinite', animationDelay: '0.5s', textShadow: '0 0 10px #ff69b4' }}>*</span>
                <span className="absolute bottom-2 left-2 text-2xl text-purple-400" style={{ animation: 'float 2.5s ease-in-out infinite', animationDelay: '1s', textShadow: '0 0 10px #8a2be2' }}>✨</span>
                <span className="absolute bottom-8 right-6 text-xl text-blue-400" style={{ animation: 'float 2.5s ease-in-out infinite', animationDelay: '1.5s', textShadow: '0 0 10px #00bfff' }}>*</span>
              </>
            )}
          </>
        )}

        {/* Glow effect when thriving */}
        {isThriving && (
          <div
            className="absolute inset-0 rounded-full opacity-30 animate-pulse"
            style={thrivingGlowStyle}
          />
        )}

        {/* Render either custom sprite or emoji */}
        {hasCustomSprite ? (
          <div
            className="transition-transform duration-300"
            style={spriteStyle}
          >
            <PetSprite
              speciesId={species.id}
              mood={effectiveMood}
              size={160}
            />
          </div>
        ) : (
          <>
            {/* The pet emoji for non-custom species */}
            <span
              className="text-9xl drop-shadow-lg"
              style={emojiFilterStyle}
            >
              {species.emoji}
            </span>

            {/* Emotion indicator for emoji pets */}
            {getEmotionEmoji() && (
              <span className="absolute -top-2 -right-2 text-3xl animate-bounce">
                {getEmotionEmoji()}
              </span>
            )}
          </>
        )}

          {/* Action feedback for sprite pets */}
          {hasCustomSprite && actionMood === 'eating' && (
            <div className="absolute top-16 right-4 text-xl animate-bounce text-yellow-400 font-bold">
              nom nom
            </div>
          )}

          {/* FEAT-002: Heart particles on tap */}
          {heartParticles.map(heart => (
            <div
              key={heart.id}
              className="absolute pointer-events-none text-2xl animate-bounce"
              style={{
                left: `${heart.x}%`,
                top: `${heart.y}%`,
                animation: 'float 1s ease-out forwards',
                color: '#FF69B4',
                textShadow: '0 0 10px rgba(255,105,180,0.8)',
              }}
            >
              ♥
            </div>
          ))}
        </div>
      </ParallaxStage>

      {/* Species description */}
      <p className="mt-4 text-sm text-gray-400 text-center max-w-xs relative z-20">
        {species.description}
      </p>

      {/* Thriving bonus indicator */}
      {isThriving && (
        <div className="mt-2 px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-sm font-medium relative z-20">
          THRIVING! +10 bonus coins
        </div>
      )}

      {/* Evolution ready indicator */}
      {canEvolveNow && (
        <button
          onClick={onEvolutionClick}
          className="mt-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full
                     text-white text-sm font-bold animate-pulse hover:scale-105 transition-transform btn-press relative z-20"
        >
          READY TO EVOLVE!
        </button>
      )}
    </div>
  )
}
