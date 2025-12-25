// Sound effect hooks (no actual audio files needed yet)
export type SoundType =
  | 'tap'
  | 'coin'
  | 'feed'
  | 'play'
  | 'clean'
  | 'sleep'
  | 'gacha_roll'
  | 'gacha_reveal_common'
  | 'gacha_reveal_rare'
  | 'gacha_reveal_epic'
  | 'gacha_reveal_legendary'
  | 'level_up'
  | 'achievement'
  | 'evolve'
  | 'error'

export const playSound = (sound: SoundType) => {
  // Will be implemented with actual audio later
  if (import.meta.env.DEV) console.log(`[Sound] ${sound}`)
}

// Haptic feedback
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error'

export const haptic = (type: HapticType) => {
  if ('vibrate' in navigator) {
    switch(type) {
      case 'light': navigator.vibrate(10); break;
      case 'medium': navigator.vibrate(25); break;
      case 'heavy': navigator.vibrate(50); break;
      case 'success': navigator.vibrate([10, 50, 10]); break;
      case 'error': navigator.vibrate([50, 50, 50]); break;
    }
  }
}

// Convenience function for combined feedback
export const feedback = (sound: SoundType, hapticType?: HapticType) => {
  playSound(sound)
  if (hapticType) {
    haptic(hapticType)
  }
}
