import { useGameStore, PET_SPECIES } from '../stores/gameStore'
import { playSound, haptic } from '../utils/feedback'
import Modal from './Modal'

interface CollectionModalProps {
  onClose: () => void
}

export default function CollectionModal({ onClose }: CollectionModalProps) {
  const { pets, activePetId, setActivePet, unlockedSpecies } = useGameStore()

  const handleClose = () => {
    playSound('tap')
    haptic('light')
    onClose()
  }

  const handleSelectPet = (petId: string) => {
    playSound('tap')
    haptic('medium')
    setActivePet(petId)
  }

  const progressPercent = Math.round((unlockedSpecies.length / PET_SPECIES.length) * 100)

  return (
    <Modal onClose={handleClose} maxWidth="sm" className="max-h-[80vh]">
      {/* Header glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px
                       bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />

        <h2 className="text-2xl font-bold text-center mb-2">
          <span className="bg-gradient-to-r from-pink-400 to-purple-500
                          bg-clip-text text-transparent">
            Your Pets
          </span>
        </h2>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Collection Progress</span>
            <span className="text-pink-400 font-medium">
              {unlockedSpecies.length} / {PET_SPECIES.length} species
            </span>
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500
                        stat-shimmer transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Pet list */}
        <div className="flex-1 overflow-y-auto space-y-2 hide-scrollbar -mx-2 px-2">
          {pets.length === 0 ? (
            <div className="text-center text-gray-500 py-8 glass rounded-2xl">
              <span className="text-5xl block mb-3 animate-float">🥚</span>
              <p className="font-medium">No pets yet!</p>
              <p className="text-sm mt-1">Hatch your first one!</p>
            </div>
          ) : (
            pets.map((pet, index) => {
              const species = PET_SPECIES.find(s => s.id === pet.speciesId)
              if (!species) return null

              const isActive = pet.id === activePetId
              const avgStats = (pet.stats.hunger + pet.stats.happiness + pet.stats.energy + pet.stats.cleanliness) / 4

              return (
                <button
                  key={pet.id}
                  onClick={() => handleSelectPet(pet.id)}
                  className={`w-full p-3 rounded-xl flex items-center gap-3
                             transition-all duration-200 btn-press
                             ${isActive
                               ? 'glass border-2 border-pink-500/50 shadow-lg shadow-pink-500/20'
                               : 'glass border-2 border-transparent hover:border-white/20 hover:bg-white/5'
                             }`}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {/* Pet emoji with glow */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                                  ${isActive ? 'bg-pink-500/20' : 'bg-white/5'}`}>
                    <span
                      className="text-3xl"
                      style={{
                        filter: species.rarity >= 4
                          ? `drop-shadow(0 0 10px ${species.color})`
                          : species.rarity >= 3
                          ? `drop-shadow(0 0 5px ${species.color})`
                          : 'none'
                      }}
                    >
                      {species.emoji}
                    </span>
                  </div>

                  {/* Pet info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{pet.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-gray-300">
                        Lv.{pet.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span className={`rarity-${species.rarity}`}>
                        {'⭐'.repeat(species.rarity)}
                      </span>
                      <span className="text-gray-500">|</span>
                      <span className={`font-medium ${
                        avgStats > 70 ? 'text-green-400' :
                        avgStats > 40 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {Math.round(avgStats)}% health
                      </span>
                    </div>
                  </div>

                  {/* Active badge */}
                  {isActive && (
                    <span className="text-xs bg-gradient-to-r from-pink-500 to-purple-500
                                    text-white px-2.5 py-1 rounded-full font-medium
                                    shadow-lg shadow-pink-500/30">
                      Active
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Discovered species grid */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <h3 className="text-sm font-medium text-gray-400 mb-3 text-center">Species Discovered</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {PET_SPECIES.map(species => {
              const isUnlocked = unlockedSpecies.includes(species.id)
              return (
                <div
                  key={species.id}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center
                             transition-all duration-200
                             ${isUnlocked
                               ? 'glass hover:scale-110'
                               : 'bg-black/40 border border-white/5'
                             }`}
                  title={isUnlocked ? species.name : '???'}
                >
                  <span
                    className={isUnlocked ? '' : 'opacity-20 grayscale'}
                    style={{
                      filter: isUnlocked && species.rarity >= 4
                        ? `drop-shadow(0 0 5px ${species.color})`
                        : 'none'
                    }}
                  >
                    {isUnlocked ? species.emoji : '❓'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="mt-4 w-full py-2.5 text-gray-400 hover:text-white transition
                  hover:bg-white/5 rounded-xl"
      >
        Close
      </button>
    </Modal>
  )
}
