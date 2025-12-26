// Beautiful SVG icons to replace emojis throughout the app
// All icons are designed to be crisp and professional

interface IconProps {
  size?: number
  className?: string
}

// Golden egg with shine - for gacha/hatching
export const EggIcon = ({ size = 24, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="eggGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE4B5" />
        <stop offset="30%" stopColor="#FFD700" />
        <stop offset="70%" stopColor="#FFA500" />
        <stop offset="100%" stopColor="#FF8C00" />
      </linearGradient>
      <linearGradient id="eggShine" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
    </defs>
    <ellipse cx="12" cy="13" rx="8" ry="10" fill="url(#eggGold)" />
    <ellipse cx="9" cy="9" rx="3" ry="4" fill="url(#eggShine)" />
  </svg>
)

// Coin with $ symbol
export const CoinIcon = ({ size = 24, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="coinGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE066" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#F4A900" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#coinGold)" stroke="#D4A500" strokeWidth="1" />
    <circle cx="12" cy="12" r="7" fill="none" stroke="#D4A500" strokeWidth="0.5" opacity="0.5" />
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#8B6914">$</text>
  </svg>
)

// Trophy for achievements
export const TrophyIcon = ({ size = 24, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE066" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#DAA520" />
      </linearGradient>
    </defs>
    <path d="M6 2h12v3c0 3-2 5-4 6v2h2v2H8v-2h2v-2c-2-1-4-3-4-6V2z" fill="url(#trophyGold)" />
    <path d="M6 4H3v2c0 2 1 3 3 4V4z" fill="url(#trophyGold)" />
    <path d="M18 4h3v2c0 2-1 3-3 4V4z" fill="url(#trophyGold)" />
    <rect x="8" y="17" width="8" height="2" rx="1" fill="url(#trophyGold)" />
    <rect x="6" y="19" width="12" height="3" rx="1" fill="url(#trophyGold)" />
  </svg>
)

// Sparkle/star effect
export const SparkleIcon = ({ size = 24, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
)

// Star for ratings/rarity
export const StarIcon = ({ size = 24, className = '', filled = true }: IconProps & { filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="starGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE066" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#F4A900" />
      </linearGradient>
    </defs>
    <path
      d="M12 2l2.9 5.9 6.5.9-4.7 4.6 1.1 6.6-5.8-3-5.8 3 1.1-6.6-4.7-4.6 6.5-.9L12 2z"
      fill={filled ? "url(#starGold)" : "none"}
      stroke="#DAA520"
      strokeWidth="1"
    />
  </svg>
)

// Fire flame
export const FlameIcon = ({ size = 24, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="flameGrad" x1="50%" y1="100%" x2="50%" y2="0%">
        <stop offset="0%" stopColor="#FF4500" />
        <stop offset="50%" stopColor="#FF8C00" />
        <stop offset="100%" stopColor="#FFD700" />
      </linearGradient>
    </defs>
    <path d="M12 2c-3 4-6 7-6 12 0 4 3 7 6 7s6-3 6-7c0-5-3-8-6-12zm0 17c-2 0-4-2-4-5 0-3 2-5 4-8 2 3 4 5 4 8 0 3-2 5-4 5z" fill="url(#flameGrad)" />
  </svg>
)

// Gift box
export const GiftIcon = ({ size = 24, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="giftRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="100%" stopColor="#EE5A5A" />
      </linearGradient>
      <linearGradient id="giftGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#DAA520" />
      </linearGradient>
    </defs>
    <rect x="3" y="8" width="18" height="4" rx="1" fill="url(#giftRed)" />
    <rect x="4" y="12" width="16" height="10" rx="1" fill="url(#giftRed)" />
    <rect x="10" y="8" width="4" height="14" fill="url(#giftGold)" />
    <rect x="3" y="9" width="18" height="2" fill="url(#giftGold)" />
    <path d="M8 8c0-3 2-5 4-5s4 2 4 5" fill="none" stroke="url(#giftGold)" strokeWidth="2" />
  </svg>
)

// Question mark for unknown/locked
export const QuestionIcon = ({ size = 24, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <circle cx="12" cy="12" r="10" fill="#4a4a6a" opacity="0.3" />
    <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#6b7280">?</text>
  </svg>
)

// Info icon
export const InfoIcon = ({ size = 24, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <circle cx="12" cy="12" r="10" fill="#60a5fa" />
    <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">i</text>
  </svg>
)

// Warning triangle
export const WarningIcon = ({ size = 24, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path d="M12 2L2 20h20L12 2z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
    <text x="12" y="17" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#78350f">!</text>
  </svg>
)

// Celebration/confetti burst
export const CelebrationIcon = ({ size = 24, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="confetti1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="100%" stopColor="#FF8E8E" />
      </linearGradient>
      <linearGradient id="confetti2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4ECDC4" />
        <stop offset="100%" stopColor="#6EE7DF" />
      </linearGradient>
      <linearGradient id="confetti3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD93D" />
        <stop offset="100%" stopColor="#FFE566" />
      </linearGradient>
    </defs>
    <rect x="6" y="8" width="3" height="6" rx="1" fill="url(#confetti1)" transform="rotate(-20 7.5 11)" />
    <rect x="15" y="8" width="3" height="6" rx="1" fill="url(#confetti2)" transform="rotate(20 16.5 11)" />
    <rect x="10" y="5" width="3" height="6" rx="1" fill="url(#confetti3)" />
    <circle cx="5" cy="5" r="1.5" fill="#FF6B6B" />
    <circle cx="19" cy="6" r="1.5" fill="#4ECDC4" />
    <circle cx="12" cy="19" r="1.5" fill="#FFD93D" />
    <circle cx="8" cy="18" r="1" fill="#FF8E8E" />
    <circle cx="16" cy="17" r="1" fill="#6EE7DF" />
  </svg>
)

// Rarity stars component
export const RarityStars = ({ count, size = 14, className = '' }: { count: number; size?: number; className?: string }) => (
  <span className={`inline-flex gap-0.5 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <StarIcon key={i} size={size} />
    ))}
  </span>
)
