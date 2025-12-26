import { useState, useEffect } from 'react'
import { useGameStore, PET_SPECIES } from '../stores/gameStore'
import { playSound, haptic } from '../utils/feedback'
import { Flame, Droplets, Leaf, Gift } from 'lucide-react'

// Type icons as components
const TYPE_ICONS: Record<string, React.ReactNode> = {
  Fire: <Flame size={14} />,
  Water: <Droplets size={14} />,
  Nature: <Leaf size={14} />,
  Holiday: <Gift size={14} />,
}

const STARTERS = [
  { id: 'fox', name: 'Pyro Pup', type: 'Fire', desc: 'Energetic and playful! Needs lots of attention.', gradient: 'from-rose-400 to-orange-400', color: '#f43f5e' },
  { id: 'blob', name: 'Aqua Blob', type: 'Water', desc: 'Calm and easy-going. Perfect for beginners!', gradient: 'from-sky-400 to-cyan-400', color: '#0ea5e9' },
  { id: 'chick', name: 'Leaf Sprite', type: 'Nature', desc: 'Always hungry but super cheerful!', gradient: 'from-lime-400 to-emerald-400', color: '#84cc16' },
  { id: 'reindeer', name: 'Rudolph Jr', type: 'Holiday', desc: 'Special Christmas edition! Nose glows at night!', gradient: 'from-rose-400 to-emerald-400', color: '#ec4899' },
]

export default function StarterPicker() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showContent, setShowContent] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const { addPet } = useGameStore()

  // Animate content on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSelect = (id: string) => {
    playSound('tap')
    haptic('light')
    setSelectedId(id)
  }

  const handleConfirm = () => {
    if (!selectedId || confirming) return
    setConfirming(true)

    playSound('gacha_reveal_common')
    haptic('success')

    // Add delay for dramatic effect
    setTimeout(() => {
      addPet(selectedId)
    }, 500)
  }

  const selectedSpecies = selectedId ? PET_SPECIES.find(s => s.id === selectedId) : null
  const selectedStarter = selectedId ? STARTERS.find(s => s.id === selectedId) : null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Title */}
      <div className={`text-center mb-10 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <h1 className="text-5xl font-bold mb-3">
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500
                          bg-clip-text text-transparent">
            PetPocket
          </span>
        </h1>
        <p className="text-purple-400 text-lg font-medium">Choose your first companion!</p>
      </div>

      {/* Starter grid */}
      <div className={`grid grid-cols-2 gap-4 w-full max-w-md mb-8 transition-all duration-700 delay-150 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {STARTERS.map((starter, index) => {
          const species = PET_SPECIES.find(s => s.id === starter.id)
          if (!species) return null

          const isSelected = selectedId === starter.id

          return (
            <button
              key={starter.id}
              onClick={() => handleSelect(starter.id)}
              className={`relative p-5 rounded-2xl flex flex-col items-center
                         transition-all duration-300 btn-press overflow-hidden
                         ${isSelected
                           ? 'scale-105 z-10'
                           : 'glass hover:bg-white/10 hover:scale-102'
                         }`}
              style={{
                transitionDelay: `${index * 50}ms`
              }}
            >
              {/* Selected state background */}
              {isSelected && (
                <>
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${starter.gradient} opacity-20`} />
                  {/* Glass overlay */}
                  <div className="absolute inset-0 glass" />
                  {/* Border glow */}
                  <div className={`absolute inset-0 rounded-2xl border-2 border-white/30`}
                       style={{
                         boxShadow: `0 0 20px ${species.color}40, inset 0 0 20px ${species.color}20`
                       }} />
                </>
              )}

              {/* Type badge */}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
                             ${isSelected
                               ? `bg-gradient-to-r ${starter.gradient} text-white`
                               : 'bg-white/50 text-gray-600'
                             }`}>
                {TYPE_ICONS[starter.type]}
              </div>

              {/* Pet emoji */}
              <div className="relative z-10 mb-3">
                <span
                  className={`text-6xl block transition-all duration-300
                             ${isSelected ? 'animate-float' : ''}`}
                  style={{
                    filter: isSelected
                      ? `drop-shadow(0 0 20px ${species.color}) drop-shadow(0 0 40px ${species.color})`
                      : 'none'
                  }}
                >
                  {species.emoji}
                </span>
              </div>

              {/* Name and type */}
              <span className={`relative z-10 font-bold text-base mb-0.5 ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                {starter.name}
              </span>
              <span className={`relative z-10 text-xs font-medium flex items-center gap-1
                              ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                {TYPE_ICONS[starter.type]} {starter.type}
              </span>

              {/* Description */}
              <p className={`relative z-10 text-xs mt-2 text-center leading-relaxed
                           ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                {starter.desc}
              </p>
            </button>
          )
        })}
      </div>

      {/* Confirm button */}
      <div className={`w-full max-w-md transition-all duration-700 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <button
          onClick={handleConfirm}
          disabled={!selectedId || confirming}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300
                     btn-3d relative overflow-hidden
                     ${selectedId && !confirming
                       ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-[1.02] shadow-xl shadow-pink-500/30'
                       : 'bg-gray-700/50 text-gray-400 cursor-not-allowed btn-disabled'
                     }`}
        >
          {/* Button glow */}
          {selectedId && !confirming && (
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/50 to-purple-500/50 blur-xl opacity-50" />
          )}

          <span className="relative z-10 flex items-center justify-center gap-2">
            {confirming ? (
              <>
                <span className="animate-spin">✨</span>
                <span>Hatching...</span>
              </>
            ) : selectedId ? (
              <>
                <span className="text-xl">{selectedSpecies?.emoji}</span>
                <span>Begin Adventure!</span>
              </>
            ) : (
              'Pick a friend!'
            )}
          </span>
        </button>

        {/* Selected pet info */}
        {selectedId && selectedStarter && (
          <div className="mt-4 text-center text-sm text-gray-400 animate-fade-in">
            You selected <span className="text-white font-medium">{selectedStarter.name}</span>
          </div>
        )}
      </div>

      {/* Footer message */}
      <p className={`mt-10 text-center text-sm text-purple-400/70 max-w-xs transition-all duration-700 delay-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        Take good care of your new friend and they'll bring you joy!
      </p>
    </div>
  )
}
