import { useState, useEffect } from 'react'

// Pet mood types
export type PetMood = 'idle' | 'happy' | 'sad' | 'eating' | 'sleeping'

interface PetSpriteProps {
  speciesId: string
  mood: PetMood
  size?: number
  className?: string
}

// CSS keyframes as a style tag - we'll inject this once

// Blobby - Green Blob Pet
const BlobbySprite = ({ mood, size = 120 }: { mood: PetMood; size?: number }) => {
  const [showFireParticles, setShowFireParticles] = useState(false)

  useEffect(() => {
    if (mood === 'eating') {
      setShowFireParticles(true)
      const timer = setTimeout(() => setShowFireParticles(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [mood])

  const getAnimation = () => {
    switch (mood) {
      case 'happy': return 'blob-happy 0.5s ease-in-out infinite'
      case 'sad': return 'blob-sad 2s ease-in-out infinite'
      case 'eating': return 'blob-eat 0.3s ease-in-out infinite'
      case 'sleeping': return 'blob-sleep 3s ease-in-out infinite'
      default: return 'blob-bounce 2s ease-in-out infinite'
    }
  }

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ animation: getAnimation() }}>
      <defs>
        <radialGradient id="blobGradient" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#90EE90" />
          <stop offset="50%" stopColor="#3CB371" />
          <stop offset="100%" stopColor="#228B22" />
        </radialGradient>
        <filter id="blobShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.3"/>
        </filter>
        <filter id="blobGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Main blob body */}
      <ellipse
        cx="60"
        cy="65"
        rx="45"
        ry={mood === 'sleeping' ? 30 : 40}
        fill="url(#blobGradient)"
        filter={mood === 'happy' ? 'url(#blobGlow)' : 'url(#blobShadow)'}
      />

      {/* Shine highlight */}
      <ellipse cx="45" cy="50" rx="15" ry="10" fill="rgba(255,255,255,0.4)" />

      {/* Eyes */}
      {mood !== 'sleeping' ? (
        <>
          <ellipse cx="45" cy="60" rx="8" ry={mood === 'happy' ? 4 : 10} fill="#1a1a2e" />
          <ellipse cx="75" cy="60" rx="8" ry={mood === 'happy' ? 4 : 10} fill="#1a1a2e" />
          {mood !== 'sad' && (
            <>
              <circle cx="47" cy="57" r="3" fill="white" />
              <circle cx="77" cy="57" r="3" fill="white" />
            </>
          )}
        </>
      ) : (
        <>
          <path d="M37 60 Q45 65, 53 60" stroke="#1a1a2e" strokeWidth="3" fill="none" />
          <path d="M67 60 Q75 65, 83 60" stroke="#1a1a2e" strokeWidth="3" fill="none" />
        </>
      )}

      {/* Mouth */}
      {mood === 'happy' && (
        <path d="M50 75 Q60 85, 70 75" stroke="#1a1a2e" strokeWidth="3" fill="none" />
      )}
      {mood === 'sad' && (
        <path d="M50 80 Q60 72, 70 80" stroke="#1a1a2e" strokeWidth="3" fill="none" />
      )}
      {mood === 'eating' && (
        <ellipse cx="60" cy="78" rx="8" ry="6" fill="#1a1a2e" />
      )}

      {/* Blush cheeks when happy */}
      {mood === 'happy' && (
        <>
          <ellipse cx="35" cy="70" rx="8" ry="5" fill="rgba(255,182,193,0.6)" />
          <ellipse cx="85" cy="70" rx="8" ry="5" fill="rgba(255,182,193,0.6)" />
        </>
      )}

      {/* Sleeping Z's */}
      {mood === 'sleeping' && (
        <>
          <text x="85" y="40" fontSize="14" fill="#4a4a6a" style={{ animation: 'sleep-z 2s ease-in-out infinite' }}>z</text>
          <text x="95" y="30" fontSize="18" fill="#4a4a6a" style={{ animation: 'sleep-z 2s ease-in-out infinite 0.5s' }}>Z</text>
          <text x="105" y="20" fontSize="22" fill="#4a4a6a" style={{ animation: 'sleep-z 2s ease-in-out infinite 1s' }}>Z</text>
        </>
      )}

      {/* Happy sparkles */}
      {mood === 'happy' && (
        <>
          <text x="20" y="30" fontSize="16" style={{ animation: 'sparkle 1s ease-in-out infinite' }}>*</text>
          <text x="95" y="35" fontSize="14" style={{ animation: 'sparkle 1s ease-in-out infinite 0.3s' }}>*</text>
          <text x="15" y="90" fontSize="12" style={{ animation: 'sparkle 1s ease-in-out infinite 0.6s' }}>*</text>
        </>
      )}

      {/* Sad tear */}
      {mood === 'sad' && (
        <ellipse cx="40" cy="72" rx="3" ry="5" fill="#87CEEB" style={{ animation: 'tear-drop 1.5s ease-in-out infinite' }} />
      )}

      {/* Food particles when eating */}
      {showFireParticles && (
        <>
          <circle cx="50" cy="70" r="3" fill="#FFD700" style={{ animation: 'food-particle 0.5s ease-out forwards' }} />
          <circle cx="70" cy="68" r="2" fill="#FFA500" style={{ animation: 'food-particle 0.5s ease-out forwards 0.1s' }} />
          <circle cx="55" cy="65" r="2" fill="#FFD700" style={{ animation: 'food-particle 0.5s ease-out forwards 0.2s' }} />
        </>
      )}
    </svg>
  )
}

// Fox Kit - Cute Fox Pet
const FoxKitSprite = ({ mood, size = 120 }: { mood: PetMood; size?: number }) => {
  const getBodyAnimation = () => {
    switch (mood) {
      case 'happy': return 'fox-idle 0.3s ease-in-out infinite'
      case 'sad': return 'fox-sad 2s ease-in-out infinite'
      case 'eating': return 'fox-eat 0.3s ease-in-out infinite'
      case 'sleeping': return 'fox-sleep 3s ease-in-out infinite'
      default: return 'fox-idle 1.5s ease-in-out infinite'
    }
  }

  const getTailAnimation = () => {
    if (mood === 'happy') return 'fox-happy-tail 0.3s ease-in-out infinite'
    if (mood === 'sleeping') return 'none'
    return 'fox-tail 1s ease-in-out infinite'
  }

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ animation: getBodyAnimation() }}>
      <defs>
        <linearGradient id="foxFur" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8C42" />
          <stop offset="100%" stopColor="#D2691E" />
        </linearGradient>
        <linearGradient id="foxBelly" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF8DC" />
          <stop offset="100%" stopColor="#FFE4B5" />
        </linearGradient>
        <filter id="foxShadow">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.25"/>
        </filter>
      </defs>

      {/* Tail */}
      <g style={{ transformOrigin: '25px 80px', animation: getTailAnimation() }}>
        <ellipse cx="25" cy="80" rx="20" ry="12" fill="url(#foxFur)" transform="rotate(-30 25 80)" />
        <ellipse cx="12" cy="75" rx="8" ry="6" fill="#FFF8DC" transform="rotate(-30 12 75)" />
      </g>

      {/* Body */}
      <ellipse cx="60" cy="75" rx="35" ry="25" fill="url(#foxFur)" filter="url(#foxShadow)" />

      {/* Belly */}
      <ellipse cx="60" cy="80" rx="22" ry="18" fill="url(#foxBelly)" />

      {/* Head */}
      <ellipse cx="60" cy="45" rx="30" ry="25" fill="url(#foxFur)" />

      {/* Face white patch */}
      <ellipse cx="60" cy="50" rx="18" ry="15" fill="#FFF8DC" />

      {/* Ears */}
      <g style={{ transformOrigin: '40px 20px', animation: mood === 'happy' ? 'fox-ears 0.5s ease-in-out infinite' : 'none' }}>
        <polygon points="35,35 25,10 45,25" fill="url(#foxFur)" />
        <polygon points="37,32 30,18 42,27" fill="#FFB6C1" />
      </g>
      <g style={{ transformOrigin: '80px 20px', animation: mood === 'happy' ? 'fox-ears 0.5s ease-in-out infinite 0.2s' : 'none' }}>
        <polygon points="85,35 95,10 75,25" fill="url(#foxFur)" />
        <polygon points="83,32 90,18 78,27" fill="#FFB6C1" />
      </g>

      {/* Eyes */}
      {mood !== 'sleeping' ? (
        <>
          <ellipse cx="48" cy="42" rx="6" ry={mood === 'happy' ? 3 : 7} fill="#2d1b00" />
          <ellipse cx="72" cy="42" rx="6" ry={mood === 'happy' ? 3 : 7} fill="#2d1b00" />
          {mood !== 'sad' && (
            <>
              <circle cx="50" cy="40" r="2" fill="white" />
              <circle cx="74" cy="40" r="2" fill="white" />
            </>
          )}
        </>
      ) : (
        <>
          <path d="M42 42 Q48 46, 54 42" stroke="#2d1b00" strokeWidth="2" fill="none" />
          <path d="M66 42 Q72 46, 78 42" stroke="#2d1b00" strokeWidth="2" fill="none" />
        </>
      )}

      {/* Nose */}
      <ellipse cx="60" cy="52" rx="5" ry="4" fill="#2d1b00" />
      <ellipse cx="59" cy="51" rx="1.5" ry="1" fill="rgba(255,255,255,0.4)" />

      {/* Mouth */}
      {mood === 'happy' && (
        <path d="M54 56 Q60 62, 66 56" stroke="#2d1b00" strokeWidth="2" fill="none" />
      )}
      {mood === 'sad' && (
        <path d="M54 60 Q60 55, 66 60" stroke="#2d1b00" strokeWidth="2" fill="none" />
      )}
      {mood === 'eating' && (
        <ellipse cx="60" cy="58" rx="4" ry="3" fill="#2d1b00" />
      )}

      {/* Blush */}
      {mood === 'happy' && (
        <>
          <ellipse cx="38" cy="48" rx="6" ry="4" fill="rgba(255,182,193,0.5)" />
          <ellipse cx="82" cy="48" rx="6" ry="4" fill="rgba(255,182,193,0.5)" />
        </>
      )}

      {/* Sleep Z's */}
      {mood === 'sleeping' && (
        <>
          <text x="85" y="30" fontSize="12" fill="#4a4a6a" style={{ animation: 'sleep-z 2s ease-in-out infinite' }}>z</text>
          <text x="95" y="20" fontSize="16" fill="#4a4a6a" style={{ animation: 'sleep-z 2s ease-in-out infinite 0.5s' }}>Z</text>
        </>
      )}

      {/* Sparkles when happy */}
      {mood === 'happy' && (
        <>
          <circle cx="25" cy="25" r="3" fill="#FFD700" style={{ animation: 'sparkle 0.8s ease-in-out infinite' }} />
          <circle cx="95" cy="30" r="2" fill="#FFD700" style={{ animation: 'sparkle 0.8s ease-in-out infinite 0.4s' }} />
        </>
      )}

      {/* Tear when sad */}
      {mood === 'sad' && (
        <ellipse cx="45" cy="50" rx="2" ry="4" fill="#87CEEB" style={{ animation: 'tear-drop 1.5s ease-in-out infinite' }} />
      )}
    </svg>
  )
}

// Dragon - Small Dragon Pet
const DragonSprite = ({ mood, size = 120 }: { mood: PetMood; size?: number }) => {
  const [showFire, setShowFire] = useState(false)

  useEffect(() => {
    if (mood === 'idle' || mood === 'happy') {
      const interval = setInterval(() => {
        setShowFire(true)
        setTimeout(() => setShowFire(false), 500)
      }, mood === 'happy' ? 2000 : 4000)
      return () => clearInterval(interval)
    }
  }, [mood])

  const getAnimation = () => {
    switch (mood) {
      case 'happy': return 'dragon-happy 0.8s ease-in-out infinite'
      case 'sad': return 'dragon-sad 2s ease-in-out infinite'
      case 'sleeping': return 'none'
      default: return 'dragon-hover 2s ease-in-out infinite'
    }
  }

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ animation: getAnimation() }}>
      <defs>
        <linearGradient id="dragonBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9370DB" />
          <stop offset="50%" stopColor="#7B68EE" />
          <stop offset="100%" stopColor="#6A5ACD" />
        </linearGradient>
        <linearGradient id="dragonBelly" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DDA0DD" />
          <stop offset="100%" stopColor="#DA70D6" />
        </linearGradient>
        <linearGradient id="fireGradient" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#FF4500" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>
        <filter id="fireGlow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="dragonShadow">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#4B0082" floodOpacity="0.4"/>
        </filter>
      </defs>

      {/* Wings */}
      <g style={{ transformOrigin: '30px 50px', animation: mood !== 'sleeping' ? 'dragon-wings 1s ease-in-out infinite' : 'none' }}>
        <path d="M30 50 Q10 30, 20 55 Q15 45, 25 55 Q20 50, 30 55" fill="url(#dragonBody)" opacity="0.8" />
      </g>
      <g style={{ transformOrigin: '90px 50px', animation: mood !== 'sleeping' ? 'dragon-wings 1s ease-in-out infinite 0.5s' : 'none' }}>
        <path d="M90 50 Q110 30, 100 55 Q105 45, 95 55 Q100 50, 90 55" fill="url(#dragonBody)" opacity="0.8" />
      </g>

      {/* Tail */}
      <path d="M30 75 Q15 85, 20 95 Q25 100, 15 105" stroke="url(#dragonBody)" strokeWidth="8" fill="none" strokeLinecap="round" />
      <circle cx="15" cy="105" r="4" fill="#FFD700" />

      {/* Body */}
      <ellipse cx="60" cy="70" rx="30" ry="22" fill="url(#dragonBody)" filter="url(#dragonShadow)" />

      {/* Belly */}
      <ellipse cx="60" cy="75" rx="18" ry="14" fill="url(#dragonBelly)" />

      {/* Spikes on back */}
      <polygon points="45,50 50,40 55,50" fill="#FFD700" />
      <polygon points="55,48 60,36 65,48" fill="#FFD700" />
      <polygon points="65,50 70,40 75,50" fill="#FFD700" />

      {/* Head */}
      <ellipse cx="60" cy="40" rx="22" ry="18" fill="url(#dragonBody)" />

      {/* Horns */}
      <polygon points="42,28 38,12 48,25" fill="#FFD700" />
      <polygon points="78,28 82,12 72,25" fill="#FFD700" />

      {/* Snout */}
      <ellipse cx="60" cy="48" rx="12" ry="8" fill="url(#dragonBelly)" />

      {/* Nostrils */}
      <circle cx="55" cy="48" r="2" fill="#4B0082" />
      <circle cx="65" cy="48" r="2" fill="#4B0082" />

      {/* Fire breath */}
      {(showFire || mood === 'eating') && (
        <g filter="url(#fireGlow)" style={{ animation: 'dragon-fire 0.5s ease-out forwards' }}>
          <ellipse cx="80" cy="48" rx="15" ry="8" fill="url(#fireGradient)" />
          <ellipse cx="90" cy="48" rx="10" ry="5" fill="#FFD700" />
        </g>
      )}

      {/* Eyes */}
      {mood !== 'sleeping' ? (
        <>
          <ellipse cx="50" cy="38" rx="5" ry={mood === 'happy' ? 2 : 6} fill="#1a1a2e" />
          <ellipse cx="70" cy="38" rx="5" ry={mood === 'happy' ? 2 : 6} fill="#1a1a2e" />
          {mood !== 'sad' && (
            <>
              <circle cx="52" cy="36" r="2" fill="white" />
              <circle cx="72" cy="36" r="2" fill="white" />
            </>
          )}
        </>
      ) : (
        <>
          <path d="M45 38 Q50 42, 55 38" stroke="#1a1a2e" strokeWidth="2" fill="none" />
          <path d="M65 38 Q70 42, 75 38" stroke="#1a1a2e" strokeWidth="2" fill="none" />
        </>
      )}

      {/* Legs */}
      <ellipse cx="45" cy="92" rx="8" ry="6" fill="url(#dragonBody)" />
      <ellipse cx="75" cy="92" rx="8" ry="6" fill="url(#dragonBody)" />

      {/* Sleep Z's */}
      {mood === 'sleeping' && (
        <>
          <text x="80" y="25" fontSize="12" fill="#9370DB" style={{ animation: 'sleep-z 2s ease-in-out infinite' }}>z</text>
          <text x="90" y="15" fontSize="16" fill="#9370DB" style={{ animation: 'sleep-z 2s ease-in-out infinite 0.5s' }}>Z</text>
        </>
      )}

      {/* Happy sparkles */}
      {mood === 'happy' && (
        <>
          <circle cx="25" cy="25" r="3" fill="#FFD700" style={{ animation: 'sparkle 0.6s ease-in-out infinite' }} />
          <circle cx="100" cy="30" r="2" fill="#FFD700" style={{ animation: 'sparkle 0.6s ease-in-out infinite 0.3s' }} />
        </>
      )}

      {/* Sad tear */}
      {mood === 'sad' && (
        <ellipse cx="48" cy="45" rx="2" ry="4" fill="#87CEEB" style={{ animation: 'tear-drop 1.5s ease-in-out infinite' }} />
      )}
    </svg>
  )
}

// Spirit Cat - Ghostly Cat Pet
const SpiritCatSprite = ({ mood, size = 120 }: { mood: PetMood; size?: number }) => {
  const getAnimation = () => {
    switch (mood) {
      case 'happy': return 'spirit-happy 1.5s ease-in-out infinite'
      case 'sad': return 'spirit-sad 2s ease-in-out infinite'
      case 'sleeping': return 'spirit-sleep 3s ease-in-out infinite'
      default: return 'spirit-float 3s ease-in-out infinite'
    }
  }

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ animation: getAnimation() }}>
      <defs>
        <radialGradient id="spiritGlow" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#E6E6FA" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#DDA0DD" stopOpacity="0.4" />
        </radialGradient>
        <filter id="ghostBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="spiritGlowFilter">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Ethereal trail/tail */}
      <path
        d="M60 100 Q40 105, 30 95 Q20 85, 25 75"
        stroke="url(#spiritGlow)"
        strokeWidth="15"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
        style={{ animation: 'spirit-fade 2s ease-in-out infinite' }}
      />

      {/* Main body - wispy ghost cat shape */}
      <ellipse cx="60" cy="65" rx="35" ry="30" fill="url(#spiritGlow)" filter="url(#ghostBlur)" />

      {/* Head */}
      <ellipse cx="60" cy="40" rx="28" ry="24" fill="url(#spiritGlow)" filter="url(#spiritGlowFilter)" />

      {/* Ears */}
      <polygon points="38,25 30,5 48,18" fill="url(#spiritGlow)" />
      <polygon points="82,25 90,5 72,18" fill="url(#spiritGlow)" />
      <polygon points="40,23 35,12 46,19" fill="rgba(221,160,221,0.5)" />
      <polygon points="80,23 85,12 74,19" fill="rgba(221,160,221,0.5)" />

      {/* Whiskers */}
      <line x1="35" y1="50" x2="15" y2="45" stroke="rgba(200,200,255,0.6)" strokeWidth="1" />
      <line x1="35" y1="55" x2="15" y2="55" stroke="rgba(200,200,255,0.6)" strokeWidth="1" />
      <line x1="85" y1="50" x2="105" y2="45" stroke="rgba(200,200,255,0.6)" strokeWidth="1" />
      <line x1="85" y1="55" x2="105" y2="55" stroke="rgba(200,200,255,0.6)" strokeWidth="1" />

      {/* Eyes - mystical glow */}
      {mood !== 'sleeping' ? (
        <>
          <ellipse cx="48" cy="40" rx="7" ry={mood === 'happy' ? 3 : 8} fill="#9370DB" />
          <ellipse cx="72" cy="40" rx="7" ry={mood === 'happy' ? 3 : 8} fill="#9370DB" />
          <ellipse cx="48" cy="40" rx="4" ry={mood === 'happy' ? 2 : 5} fill="#E6E6FA" />
          <ellipse cx="72" cy="40" rx="4" ry={mood === 'happy' ? 2 : 5} fill="#E6E6FA" />
          {mood !== 'sad' && (
            <>
              <circle cx="50" cy="38" r="2" fill="white" />
              <circle cx="74" cy="38" r="2" fill="white" />
            </>
          )}
        </>
      ) : (
        <>
          <path d="M42 40 Q48 44, 54 40" stroke="#9370DB" strokeWidth="2" fill="none" />
          <path d="M66 40 Q72 44, 78 40" stroke="#9370DB" strokeWidth="2" fill="none" />
        </>
      )}

      {/* Nose */}
      <path d="M57 50 L60 54 L63 50 Z" fill="#DDA0DD" />

      {/* Mouth */}
      {mood === 'happy' && (
        <path d="M54 56 Q60 62, 66 56" stroke="#9370DB" strokeWidth="2" fill="none" />
      )}
      {mood === 'sad' && (
        <path d="M54 60 Q60 55, 66 60" stroke="#9370DB" strokeWidth="2" fill="none" />
      )}
      {mood === 'eating' && (
        <ellipse cx="60" cy="58" rx="4" ry="3" fill="#9370DB" />
      )}

      {/* Floating particles around spirit */}
      <circle cx="25" cy="35" r="2" fill="#E6E6FA" style={{ animation: 'sparkle 2s ease-in-out infinite' }} opacity="0.7" />
      <circle cx="95" cy="50" r="3" fill="#DDA0DD" style={{ animation: 'sparkle 2s ease-in-out infinite 0.7s' }} opacity="0.6" />
      <circle cx="30" cy="80" r="2" fill="#E6E6FA" style={{ animation: 'sparkle 2s ease-in-out infinite 1.4s' }} opacity="0.5" />

      {/* Extra sparkles when happy */}
      {mood === 'happy' && (
        <>
          <circle cx="20" cy="25" r="3" fill="#FFD700" style={{ animation: 'sparkle 0.8s ease-in-out infinite' }} />
          <circle cx="100" cy="35" r="2" fill="#FFD700" style={{ animation: 'sparkle 0.8s ease-in-out infinite 0.4s' }} />
        </>
      )}

      {/* Sleep Z's */}
      {mood === 'sleeping' && (
        <>
          <text x="80" y="25" fontSize="12" fill="#9370DB" style={{ animation: 'sleep-z 2s ease-in-out infinite' }}>z</text>
          <text x="90" y="15" fontSize="16" fill="#9370DB" style={{ animation: 'sleep-z 2s ease-in-out infinite 0.5s' }}>Z</text>
        </>
      )}

      {/* Sad tear - ghostly blue */}
      {mood === 'sad' && (
        <ellipse cx="45" cy="50" rx="2" ry="4" fill="#87CEEB" style={{ animation: 'tear-drop 1.5s ease-in-out infinite' }} opacity="0.8" />
      )}
    </svg>
  )
}

// Cosmic Whale - Space Whale Pet
const CosmicWhaleSprite = ({ mood, size = 120 }: { mood: PetMood; size?: number }) => {
  const getAnimation = () => {
    switch (mood) {
      case 'happy': return 'whale-happy 1.5s ease-in-out infinite'
      case 'sad': return 'whale-sad 2s ease-in-out infinite'
      case 'sleeping': return 'none'
      default: return 'whale-swim 3s ease-in-out infinite'
    }
  }

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ animation: getAnimation() }}>
      <defs>
        <linearGradient id="cosmicBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9400D3" />
          <stop offset="30%" stopColor="#4B0082" />
          <stop offset="60%" stopColor="#8B008B" />
          <stop offset="100%" stopColor="#FF00FF" />
        </linearGradient>
        <linearGradient id="cosmicBelly" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E6E6FA" />
          <stop offset="100%" stopColor="#DDA0DD" />
        </linearGradient>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </radialGradient>
        <filter id="cosmicGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background stars */}
      <circle cx="15" cy="20" r="2" fill="#FFD700" style={{ animation: 'whale-stars 2s ease-in-out infinite' }} />
      <circle cx="105" cy="15" r="1.5" fill="#FFFFFF" style={{ animation: 'whale-stars-alt 2s ease-in-out infinite' }} />
      <circle cx="10" cy="90" r="1" fill="#FFD700" style={{ animation: 'whale-stars 2s ease-in-out infinite 0.5s' }} />
      <circle cx="110" cy="85" r="2" fill="#FFFFFF" style={{ animation: 'whale-stars-alt 2s ease-in-out infinite 0.5s' }} />
      <circle cx="25" cy="55" r="1.5" fill="#FFD700" style={{ animation: 'whale-stars 2s ease-in-out infinite 1s' }} />
      <circle cx="95" cy="60" r="1" fill="#FFFFFF" style={{ animation: 'whale-stars-alt 2s ease-in-out infinite 1s' }} />

      {/* Tail flukes */}
      <ellipse cx="15" cy="65" rx="12" ry="8" fill="url(#cosmicBody)" transform="rotate(-30 15 65)" filter="url(#cosmicGlow)" />
      <ellipse cx="15" cy="75" rx="12" ry="8" fill="url(#cosmicBody)" transform="rotate(30 15 75)" filter="url(#cosmicGlow)" />

      {/* Main body */}
      <ellipse cx="60" cy="60" rx="45" ry="25" fill="url(#cosmicBody)" filter="url(#cosmicGlow)" />

      {/* Belly */}
      <ellipse cx="65" cy="65" rx="30" ry="15" fill="url(#cosmicBelly)" />

      {/* Cosmic patterns on body */}
      <circle cx="45" cy="50" r="3" fill="rgba(255,255,255,0.3)" />
      <circle cx="55" cy="55" r="2" fill="rgba(255,255,255,0.2)" />
      <circle cx="40" cy="60" r="1.5" fill="rgba(255,255,255,0.4)" />
      <circle cx="70" cy="48" r="2" fill="rgba(255,255,255,0.25)" />

      {/* Fins */}
      <ellipse cx="50" cy="45" rx="10" ry="5" fill="url(#cosmicBody)" transform="rotate(-30 50 45)" />
      <ellipse cx="70" cy="45" rx="10" ry="5" fill="url(#cosmicBody)" transform="rotate(30 70 45)" />

      {/* Head area */}
      <ellipse cx="95" cy="58" rx="15" ry="18" fill="url(#cosmicBody)" />

      {/* Eye */}
      {mood !== 'sleeping' ? (
        <>
          <ellipse cx="98" cy="55" rx="6" ry={mood === 'happy' ? 3 : 7} fill="#1a1a2e" />
          <ellipse cx="98" cy="55" rx="3" ry={mood === 'happy' ? 1.5 : 4} fill="#E6E6FA" />
          {mood !== 'sad' && <circle cx="100" cy="53" r="2" fill="white" />}
        </>
      ) : (
        <path d="M92 55 Q98 59, 104 55" stroke="#1a1a2e" strokeWidth="2" fill="none" />
      )}

      {/* Blowhole spray when happy */}
      {mood === 'happy' && (
        <g>
          <ellipse cx="85" cy="35" rx="3" ry="8" fill="rgba(135,206,235,0.6)" style={{ animation: 'sparkle 1s ease-in-out infinite' }} />
          <circle cx="82" cy="25" r="3" fill="rgba(135,206,235,0.4)" style={{ animation: 'sparkle 1s ease-in-out infinite 0.2s' }} />
          <circle cx="88" cy="28" r="2" fill="rgba(135,206,235,0.5)" style={{ animation: 'sparkle 1s ease-in-out infinite 0.4s' }} />
        </g>
      )}

      {/* Mouth */}
      {mood === 'happy' && (
        <path d="M100 65 Q105 70, 100 72" stroke="#1a1a2e" strokeWidth="1.5" fill="none" />
      )}
      {mood === 'sad' && (
        <path d="M100 68 Q105 65, 100 63" stroke="#1a1a2e" strokeWidth="1.5" fill="none" />
      )}
      {mood === 'eating' && (
        <ellipse cx="102" cy="65" rx="4" ry="3" fill="#1a1a2e" />
      )}

      {/* Sleep Z's */}
      {mood === 'sleeping' && (
        <>
          <text x="100" y="40" fontSize="10" fill="#9370DB" style={{ animation: 'sleep-z 2s ease-in-out infinite' }}>z</text>
          <text x="108" y="30" fontSize="14" fill="#9370DB" style={{ animation: 'sleep-z 2s ease-in-out infinite 0.5s' }}>Z</text>
        </>
      )}

      {/* Sad tear */}
      {mood === 'sad' && (
        <ellipse cx="95" cy="62" rx="2" ry="4" fill="#87CEEB" style={{ animation: 'tear-drop 1.5s ease-in-out infinite' }} />
      )}

      {/* Eating bubbles */}
      {mood === 'eating' && (
        <>
          <circle cx="108" cy="60" r="2" fill="rgba(135,206,235,0.6)" style={{ animation: 'food-particle 0.5s ease-out forwards' }} />
          <circle cx="112" cy="65" r="1.5" fill="rgba(135,206,235,0.5)" style={{ animation: 'food-particle 0.5s ease-out forwards 0.1s' }} />
        </>
      )}
    </svg>
  )
}

// Reindeer - Christmas Reindeer Pet
const ReindeerSprite = ({ mood, size = 120 }: { mood: PetMood; size?: number }) => {
  const getAnimation = () => {
    switch (mood) {
      case 'happy': return 'reindeer-happy 0.6s ease-in-out infinite'
      case 'sad': return 'reindeer-sad 2s ease-in-out infinite'
      case 'sleeping': return 'none'
      default: return 'reindeer-idle 2s ease-in-out infinite'
    }
  }

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ animation: getAnimation() }}>
      <defs>
        <linearGradient id="reindeerFur" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A0522D" />
          <stop offset="100%" stopColor="#8B4513" />
        </linearGradient>
        <linearGradient id="reindeerBelly" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DEB887" />
          <stop offset="100%" stopColor="#D2B48C" />
        </linearGradient>
        <radialGradient id="noseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF0000" />
          <stop offset="50%" stopColor="#FF4444" />
          <stop offset="100%" stopColor="#CC0000" />
        </radialGradient>
        <filter id="redGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="reindeerShadow">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.25"/>
        </filter>
      </defs>

      {/* Antlers */}
      <g style={{ animation: mood !== 'sleeping' ? 'reindeer-antlers 2s ease-in-out infinite' : 'none' }}>
        {/* Left antler */}
        <path d="M35 30 Q30 15, 20 20 M30 25 Q22 18, 18 25 M28 20 Q18 12, 15 18" stroke="#5D4E37" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Right antler */}
        <path d="M85 30 Q90 15, 100 20 M90 25 Q98 18, 102 25 M92 20 Q102 12, 105 18" stroke="#5D4E37" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>

      {/* Ears */}
      <ellipse cx="32" cy="40" rx="8" ry="12" fill="url(#reindeerFur)" transform="rotate(-20 32 40)" />
      <ellipse cx="88" cy="40" rx="8" ry="12" fill="url(#reindeerFur)" transform="rotate(20 88 40)" />
      <ellipse cx="33" cy="40" rx="5" ry="8" fill="#FFB6C1" transform="rotate(-20 33 40)" />
      <ellipse cx="87" cy="40" rx="5" ry="8" fill="#FFB6C1" transform="rotate(20 87 40)" />

      {/* Body */}
      <ellipse cx="60" cy="80" rx="32" ry="22" fill="url(#reindeerFur)" filter="url(#reindeerShadow)" />

      {/* Belly */}
      <ellipse cx="60" cy="85" rx="20" ry="14" fill="url(#reindeerBelly)" />

      {/* Legs */}
      <rect x="40" y="92" width="8" height="18" rx="4" fill="url(#reindeerFur)" />
      <rect x="72" y="92" width="8" height="18" rx="4" fill="url(#reindeerFur)" />
      <ellipse cx="44" cy="110" rx="6" ry="3" fill="#3d2817" />
      <ellipse cx="76" cy="110" rx="6" ry="3" fill="#3d2817" />

      {/* Head */}
      <ellipse cx="60" cy="50" rx="25" ry="22" fill="url(#reindeerFur)" />

      {/* Face patch */}
      <ellipse cx="60" cy="58" rx="15" ry="12" fill="url(#reindeerBelly)" />

      {/* Eyes */}
      {mood !== 'sleeping' ? (
        <>
          <ellipse cx="48" cy="48" rx="5" ry={mood === 'happy' ? 2 : 6} fill="#2d1b00" />
          <ellipse cx="72" cy="48" rx="5" ry={mood === 'happy' ? 2 : 6} fill="#2d1b00" />
          {mood !== 'sad' && (
            <>
              <circle cx="50" cy="46" r="2" fill="white" />
              <circle cx="74" cy="46" r="2" fill="white" />
            </>
          )}
        </>
      ) : (
        <>
          <path d="M43 48 Q48 52, 53 48" stroke="#2d1b00" strokeWidth="2" fill="none" />
          <path d="M67 48 Q72 52, 77 48" stroke="#2d1b00" strokeWidth="2" fill="none" />
        </>
      )}

      {/* Glowing red nose - the star of the show! */}
      <g style={{ animation: 'reindeer-nose-glow 1.5s ease-in-out infinite' }}>
        <circle cx="60" cy="62" r="8" fill="url(#noseGlow)" filter="url(#redGlow)" />
        <ellipse cx="58" cy="60" rx="2" ry="1.5" fill="rgba(255,255,255,0.5)" />
      </g>

      {/* Mouth */}
      {mood === 'happy' && (
        <path d="M52 68 Q60 75, 68 68" stroke="#2d1b00" strokeWidth="2" fill="none" />
      )}
      {mood === 'sad' && (
        <path d="M52 72 Q60 66, 68 72" stroke="#2d1b00" strokeWidth="2" fill="none" />
      )}
      {mood === 'eating' && (
        <ellipse cx="60" cy="70" rx="4" ry="3" fill="#2d1b00" />
      )}

      {/* Blush when happy */}
      {mood === 'happy' && (
        <>
          <ellipse cx="38" cy="55" rx="6" ry="4" fill="rgba(255,182,193,0.5)" />
          <ellipse cx="82" cy="55" rx="6" ry="4" fill="rgba(255,182,193,0.5)" />
        </>
      )}

      {/* Sleep Z's */}
      {mood === 'sleeping' && (
        <>
          <text x="85" y="35" fontSize="12" fill="#8B4513" style={{ animation: 'sleep-z 2s ease-in-out infinite' }}>z</text>
          <text x="95" y="25" fontSize="16" fill="#8B4513" style={{ animation: 'sleep-z 2s ease-in-out infinite 0.5s' }}>Z</text>
        </>
      )}

      {/* Happy sparkles */}
      {mood === 'happy' && (
        <>
          <circle cx="25" cy="25" r="3" fill="#FFD700" style={{ animation: 'sparkle 0.8s ease-in-out infinite' }} />
          <circle cx="95" cy="30" r="2" fill="#FFD700" style={{ animation: 'sparkle 0.8s ease-in-out infinite 0.4s' }} />
          <text x="15" y="60" fontSize="14" style={{ animation: 'sparkle 1s ease-in-out infinite 0.2s' }}>*</text>
        </>
      )}

      {/* Sad tear */}
      {mood === 'sad' && (
        <ellipse cx="45" cy="55" rx="2" ry="4" fill="#87CEEB" style={{ animation: 'tear-drop 1.5s ease-in-out infinite' }} />
      )}
    </svg>
  )
}

// Main PetSprite component that selects the right sprite
export default function PetSprite({ speciesId, mood, size = 120, className = '' }: PetSpriteProps) {
  const spriteProps = { mood, size }

  const renderSprite = () => {
    switch (speciesId) {
      case 'blob':
        return <BlobbySprite {...spriteProps} />
      case 'fox':
        return <FoxKitSprite {...spriteProps} />
      case 'dragon':
        return <DragonSprite {...spriteProps} />
      case 'spirit':
        return <SpiritCatSprite {...spriteProps} />
      case 'cosmic':
        return <CosmicWhaleSprite {...spriteProps} />
      case 'reindeer':
        return <ReindeerSprite {...spriteProps} />
      default:
        // Fallback to Blobby for unknown species
        return <BlobbySprite {...spriteProps} />
    }
  }

  return (
    <div className={`inline-block ${className}`}>
      {renderSprite()}
    </div>
  )
}

// Utility function to get the appropriate mood from pet stats
export function getPetMood(stats: { hunger: number; happiness: number; energy: number; cleanliness: number }): PetMood {
  const avgStat = (stats.hunger + stats.happiness + stats.energy + stats.cleanliness) / 4

  if (avgStat > 80) return 'happy'
  if (stats.energy < 30) return 'sleeping'
  if (avgStat < 40) return 'sad'
  return 'idle'
}

// Export individual sprites for direct use if needed
export {
  BlobbySprite,
  FoxKitSprite,
  DragonSprite,
  SpiritCatSprite,
  CosmicWhaleSprite,
  ReindeerSprite
}
