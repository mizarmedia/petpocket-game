import { useState } from 'react'
import { useGameStore, EVOLUTION_LEVELS, EVOLUTION_CARE_REQUIREMENTS } from '../stores/gameStore'
import type { Pet, PetSpecies, EvolutionStage } from '../stores/gameStore'
import PetSprite, { getPetMood } from './pets/PetSprite'
import { playSound, haptic } from '../utils/feedback'

interface EvolutionModalProps {
  pet: Pet
  species: PetSpecies
  onClose: () => void
  onEvolutionComplete?: () => void
}

type AnimationPhase = 'idle' | 'preview' | 'glowing' | 'flash' | 'transforming' | 'revealing' | 'complete'

// Map species IDs that have custom sprites
const SPRITE_SPECIES = ['blob', 'fox', 'dragon', 'spirit', 'cosmic', 'reindeer']

export default function EvolutionModal({ pet, species, onClose, onEvolutionComplete }: EvolutionModalProps) {
  const { canEvolve, evolvePet, getEvolutionProgress } = useGameStore()
  const [phase, setPhase] = useState<AnimationPhase>('idle')
  const [isEvolving, setIsEvolving] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [showScreenFlash, setShowScreenFlash] = useState(false)
  const [evolvedPet, setEvolvedPet] = useState<Pet | null>(null)

  const progress = getEvolutionProgress(pet.id)
  const canDoEvolution = canEvolve(pet.id)
  const hasCustomSprite = SPRITE_SPECIES.includes(species.id)

  // Generate particle effects based on rarity
  const particleCount = species.rarity * 8 // More particles for rarer pets

  // Get target evolution name
  const getTargetEvolutionName = (): string => {
    if (!species.evolutions || !progress.targetStage) return species.name
    if (progress.targetStage === 2) return species.evolutions[0]
    if (progress.targetStage === 3) return species.evolutions[1]
    return species.name
  }

  // Get required level/care for next evolution
  const getRequirements = () => {
    if (pet.evolutionStage >= 3) {
      return { level: 0, care: 0, levelLabel: 'Max', careLabel: 'Max' }
    }
    const isTeenEvolution = pet.evolutionStage === 1
    return {
      level: isTeenEvolution ? EVOLUTION_LEVELS.teen : EVOLUTION_LEVELS.adult,
      care: isTeenEvolution ? EVOLUTION_CARE_REQUIREMENTS.teen : EVOLUTION_CARE_REQUIREMENTS.adult,
      levelLabel: isTeenEvolution ? 'Level 10' : 'Level 25',
      careLabel: isTeenEvolution ? '50 Care Actions' : '150 Care Actions',
    }
  }

  const requirements = getRequirements()

  const handleEvolve = () => {
    if (!canDoEvolution || isEvolving) return

    setIsEvolving(true)
    playSound('tap')
    haptic('heavy')

    // Phase 0: Preview silhouette (2s)
    setPhase('preview')
    setTimeout(() => {
      setPhase('glowing')
      playSound('tap')
      haptic('medium')
    }, 2000)

    // Phase 1: Glowing (1.5s)
    setTimeout(() => {
      setShowParticles(true)
    }, 2500)

    // Phase 2: Flash (based on rarity)
    const flashDelay = 3500
    setTimeout(() => {
      setPhase('flash')
      setShowScreenFlash(true)
      haptic('heavy')

      // Hide flash after duration based on rarity
      const flashDuration = species.rarity >= 4 ? 800 : 400
      setTimeout(() => setShowScreenFlash(false), flashDuration)
    }, flashDelay)

    // Phase 3: Transforming (1.5s)
    setTimeout(() => {
      setPhase('transforming')
    }, flashDelay + 500)

    // Phase 4: Actually evolve the pet
    setTimeout(() => {
      const { pets } = useGameStore.getState()
      evolvePet(pet.id)
      const updated = pets.find(p => p.id === pet.id)
      if (updated) setEvolvedPet(updated)
      setPhase('revealing')
      playSound('evolve')
      haptic('success')
    }, flashDelay + 1800)

    // Phase 5: Complete
    setTimeout(() => {
      setPhase('complete')
      setShowParticles(false)
      setIsEvolving(false)
      onEvolutionComplete?.()
    }, flashDelay + 3500)
  }

  const getStageName = (stage: EvolutionStage): string => {
    switch (stage) {
      case 1: return 'Baby'
      case 2: return 'Teen'
      case 3: return 'Adult'
    }
  }

  const getPhaseStyles = () => {
    switch (phase) {
      case 'preview':
        return 'scale-90 opacity-60'
      case 'glowing':
        return 'animate-pulse scale-110'
      case 'flash':
        return 'scale-150 brightness-[3] saturate-0'
      case 'transforming':
        return 'animate-spin scale-0 opacity-0'
      case 'revealing':
        return 'scale-150 animate-bounce'
      case 'complete':
        return 'scale-100'
      default:
        return ''
    }
  }

  // Get current form name
  const getCurrentFormName = (): string => {
    if (pet.evolutionStage === 1) return species.name
    if (species.evolutions) {
      if (pet.evolutionStage === 2) return species.evolutions[0]
      if (pet.evolutionStage === 3) return species.evolutions[1]
    }
    return pet.name
  }

  // Render particles based on rarity
  const renderParticles = () => {
    if (!showParticles) return null

    const particles = []
    for (let i = 0; i < particleCount; i++) {
      const delay = (i * 100) % 1000
      const duration = 1000 + (i % 500)
      const size = species.rarity >= 4 ? 'text-2xl' : 'text-xl'
      const emoji = species.rarity >= 5 ? ['🌟', '💫', '✨', '⭐'][i % 4] :
                    species.rarity >= 4 ? ['✨', '⭐', '💫'][i % 3] :
                    species.rarity >= 3 ? ['✨', '⭐'][i % 2] :
                    '✨'

      const x = (i * 73) % 90 + 5 // Pseudo-random X position 5-95%
      const y = (i * 47) % 90 + 5 // Pseudo-random Y position 5-95%

      particles.push(
        <div
          key={i}
          className={`absolute ${size} animate-ping`}
          style={{
            left: `${x}%`,
            top: `${y}%`,
            animationDelay: `${delay}ms`,
            animationDuration: `${duration}ms`,
          }}
        >
          {emoji}
        </div>
      )
    }
    return particles
  }

  // Render screen flash effect
  const renderScreenFlash = () => {
    if (!showScreenFlash) return null

    const flashColor = species.rarity >= 5 ? 'bg-gradient-to-r from-purple-500 via-pink-500 via-yellow-500 to-cyan-500' :
                      species.rarity >= 4 ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500' :
                      species.rarity >= 3 ? 'bg-white' :
                      'bg-purple-300'

    return (
      <div className={`fixed inset-0 z-50 ${flashColor} animate-pulse pointer-events-none`}
           style={{ animationDuration: '0.2s' }} />
    )
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80"
      onClick={phase === 'complete' || phase === 'idle' ? onClose : undefined}
    >
      {renderScreenFlash()}

      <div
        className="bg-gradient-to-b from-indigo-900 to-purple-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border-2 border-purple-500/50 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Background shimmer effect for rare+ pets */}
        {species.rarity >= 3 && (phase === 'glowing' || phase === 'revealing') && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        )}

        <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {phase === 'complete' ? 'Evolution Complete!' :
           phase === 'preview' ? 'Evolution Preview' :
           'Evolution Chamber'}
        </h2>

        {/* Pet display */}
        <div className="relative h-48 flex items-center justify-center mb-4 bg-black/30 rounded-2xl overflow-hidden">
          {/* Animated particles */}
          {renderParticles()}

          {/* Background glow effects during evolution */}
          {(phase === 'glowing' || phase === 'transforming' || phase === 'flash') && (
            <div className={`absolute inset-0 ${
              species.rarity >= 5 ? 'bg-gradient-radial from-purple-500 via-pink-500 to-transparent' :
              species.rarity >= 4 ? 'bg-gradient-radial from-purple-500/70 to-transparent' :
              'bg-gradient-radial from-purple-500/50 to-transparent'
            } animate-pulse`} />
          )}

          {/* Reveal flash effect */}
          {phase === 'revealing' && (
            <div className="absolute inset-0 bg-gradient-radial from-yellow-300/80 to-transparent animate-ping" />
          )}

          {/* The pet */}
          <div className={`transition-all duration-500 ${getPhaseStyles()} relative z-10`}>
            {phase === 'preview' ? (
              // Silhouette preview
              <div className="relative">
                {hasCustomSprite ? (
                  <div className="filter brightness-0 opacity-40">
                    <PetSprite speciesId={species.id} mood="idle" size={160} />
                  </div>
                ) : (
                  <span className="text-8xl filter brightness-0 opacity-40">
                    {species.emoji}
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl">❓</span>
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <p className="text-sm text-purple-300 animate-pulse">
                    {getTargetEvolutionName()}
                  </p>
                </div>
              </div>
            ) : phase === 'complete' && evolvedPet ? (
              // Show evolved form
              hasCustomSprite ? (
                <PetSprite
                  speciesId={species.id}
                  mood={getPetMood(evolvedPet.stats)}
                  size={160}
                />
              ) : (
                <span className="text-8xl drop-shadow-lg">{species.emoji}</span>
              )
            ) : (
              // Show current form during evolution
              hasCustomSprite ? (
                <PetSprite
                  speciesId={species.id}
                  mood={phase === 'transforming' ? 'idle' : getPetMood(pet.stats)}
                  size={160}
                />
              ) : (
                <span
                  className="text-8xl drop-shadow-lg"
                  style={{
                    filter: phase === 'glowing' || phase === 'revealing'
                      ? `drop-shadow(0 0 30px ${species.color}) brightness(1.3)`
                      : phase === 'transforming' || phase === 'flash'
                        ? 'brightness(3) saturate(0)'
                        : 'none'
                  }}
                >
                  {species.emoji}
                </span>
              )
            )}
          </div>

          {/* Evolution stage indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500/30 rounded-full">
            <span className="text-sm text-purple-200">
              {phase === 'complete' && evolvedPet
                ? getStageName(evolvedPet.evolutionStage as EvolutionStage)
                : getStageName(pet.evolutionStage)}
            </span>
          </div>
        </div>

        {/* Evolution info */}
        {phase === 'idle' && (
          <>
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-white">{getCurrentFormName()}</h3>
              <p className="text-sm text-gray-400">
                Stage {pet.evolutionStage} / 3
              </p>
            </div>

            {pet.evolutionStage < 3 ? (
              <>
                {/* Evolution preview hint */}
                {canDoEvolution && (
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-3 mb-4 border border-purple-500/30">
                    <p className="text-sm text-center text-purple-200">
                      ✨ Ready to evolve into <span className="font-bold text-white">{getTargetEvolutionName()}</span>!
                    </p>
                  </div>
                )}

                {/* Evolution requirements */}
                <div className="bg-black/20 rounded-xl p-4 mb-4 space-y-3">
                  <p className="text-sm text-purple-300 text-center mb-2">
                    Requirements for {getStageName((pet.evolutionStage + 1) as EvolutionStage)} form:
                  </p>

                  {/* Level requirement */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Level</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${progress.levelReady ? 'text-green-400' : 'text-gray-400'}`}>
                        {pet.level} / {requirements.level}
                      </span>
                      {progress.levelReady ? (
                        <span className="text-green-400">✓</span>
                      ) : (
                        <span className="text-gray-500">○</span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar for level */}
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (pet.level / requirements.level) * 100)}%` }}
                    />
                  </div>

                  {/* Care requirement */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-gray-300">Care Actions</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${progress.careReady ? 'text-green-400' : 'text-gray-400'}`}>
                        {pet.totalCareReceived} / {requirements.care}
                      </span>
                      {progress.careReady ? (
                        <span className="text-green-400">✓</span>
                      ) : (
                        <span className="text-gray-500">○</span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar for care */}
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (pet.totalCareReceived / requirements.care) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Evolve button */}
                <button
                  onClick={handleEvolve}
                  disabled={!canDoEvolution}
                  className={`w-full py-3 rounded-xl font-bold text-white shadow-lg btn-press transition-all
                    ${canDoEvolution
                      ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:scale-105 animate-pulse'
                      : 'bg-gray-600 cursor-not-allowed'
                    }`}
                >
                  {canDoEvolution ? (
                    <span className="flex items-center justify-center gap-2">
                      <span>🦋</span>
                      <span>EVOLVE to {getTargetEvolutionName()}</span>
                    </span>
                  ) : (
                    'Requirements Not Met'
                  )}
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <span className="text-4xl mb-2">👑</span>
                <p className="text-purple-300">This pet has reached maximum evolution!</p>
              </div>
            )}
          </>
        )}

        {/* During evolution */}
        {phase === 'preview' && (
          <div className="text-center py-4">
            <p className="text-lg text-purple-200 animate-pulse">
              Preparing evolution sequence...
            </p>
          </div>
        )}
        {phase === 'glowing' && (
          <div className="text-center py-4">
            <p className="text-lg text-purple-200 animate-pulse">
              Gathering cosmic energy...
            </p>
          </div>
        )}
        {phase === 'flash' && (
          <div className="text-center py-4">
            <p className="text-lg text-white animate-pulse font-bold">
              {species.rarity >= 5 ? 'LEGENDARY TRANSFORMATION!' :
               species.rarity >= 4 ? 'EPIC EVOLUTION!' :
               species.rarity >= 3 ? 'Rare Evolution!' :
               'Evolving...'}
            </p>
          </div>
        )}
        {phase === 'transforming' && (
          <div className="text-center py-4">
            <p className="text-lg text-purple-200 animate-pulse">
              Metamorphosis in progress...
            </p>
          </div>
        )}
        {phase === 'revealing' && (
          <div className="text-center py-4">
            <p className="text-xl text-yellow-300 animate-bounce font-bold">
              Behold the new form!
            </p>
          </div>
        )}

        {/* Evolution complete */}
        {phase === 'complete' && evolvedPet && (
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">{evolvedPet.name}</h3>
            <p className="text-purple-300 mb-4">
              Your pet evolved into its {getStageName(evolvedPet.evolutionStage as EvolutionStage)} form!
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map(stage => (
                <div
                  key={stage}
                  className={`w-8 h-8 rounded-full flex items-center justify-center
                    ${stage <= evolvedPet.evolutionStage
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-700 text-gray-500'
                    }`}
                >
                  {stage}
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-white shadow-lg btn-press"
            >
              {species.rarity >= 5 ? '🌟 LEGENDARY! 🌟' :
               species.rarity >= 4 ? '✨ EPIC! ✨' :
               species.rarity >= 3 ? '⭐ RARE! ⭐' :
               'Amazing!'}
            </button>
          </div>
        )}

        {/* Close button (only when not evolving) */}
        {phase === 'idle' && (
          <button
            onClick={onClose}
            className="w-full py-2 mt-3 text-gray-400 hover:text-white transition"
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}
