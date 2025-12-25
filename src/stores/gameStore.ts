import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeLocalStorage, StorageError, showStorageError, isStorageAvailable } from '../utils/storage'

export type EvolutionStage = 1 | 2 | 3;

export interface Pet {
  id: string;
  speciesId: string;
  name: string;
  level: number;
  xp: number;
  evolutionStage: EvolutionStage;
  stats: {
    hunger: number;
    happiness: number;
    energy: number;
    cleanliness: number;
  };
  lastUpdated: number;
  totalCareReceived: number; // Track care quality for evolution
}

export type Personality = 'lazy' | 'energetic' | 'hungry' | 'playful' | 'sleepy' | 'clean';

export interface PetSpecies {
  id: string;
  name: string;
  emoji: string;
  rarity: 1 | 2 | 3 | 4 | 5;
  color: string;
  secondaryColor?: string;
  description: string;
  personality: Personality;
  evolutions?: [string, string]; // [stage2Name, stage3Name]
}

export const PET_SPECIES: PetSpecies[] = [
  // ============ COMMON (60%) - 10 pets ============
  { id: 'blob', name: 'Blobby', emoji: '🟢', rarity: 1, color: '#98FB98', secondaryColor: '#32CD32', description: 'A friendly blob that loves to bounce!', personality: 'playful', evolutions: ['Blobert', 'Blobzilla'] },
  { id: 'puff', name: 'Puffball', emoji: '🔵', rarity: 1, color: '#87CEEB', secondaryColor: '#4169E1', description: 'Fluffy and always happy!', personality: 'lazy', evolutions: ['Puffster', 'Cloudking'] },
  { id: 'dot', name: 'Dotty', emoji: '🟡', rarity: 1, color: '#FFE4B5', secondaryColor: '#FFA500', description: 'Small but full of energy!', personality: 'energetic', evolutions: ['Dottie', 'Sunspot'] },
  { id: 'slime', name: 'Goopy', emoji: '🟣', rarity: 1, color: '#DDA0DD', secondaryColor: '#9932CC', description: 'Leaves a sparkly trail everywhere!', personality: 'playful', evolutions: ['Glooper', 'Slimesire'] },
  { id: 'rock', name: 'Pebble', emoji: '🪨', rarity: 1, color: '#A9A9A9', secondaryColor: '#696969', description: 'Solid and dependable friend!', personality: 'lazy', evolutions: ['Boulder', 'Golem Jr'] },
  { id: 'leaf', name: 'Sprout', emoji: '🌱', rarity: 1, color: '#90EE90', secondaryColor: '#228B22', description: 'Grows a little every day!', personality: 'hungry', evolutions: ['Sapling', 'Treant'] },
  { id: 'drop', name: 'Dewdrop', emoji: '💧', rarity: 1, color: '#ADD8E6', secondaryColor: '#1E90FF', description: 'Fresh as morning dew!', personality: 'clean', evolutions: ['Splash', 'Tsunami'] },
  { id: 'spark', name: 'Zippy', emoji: '⚡', rarity: 1, color: '#FFD700', secondaryColor: '#FFA500', description: 'Always buzzing with energy!', personality: 'energetic', evolutions: ['Zapper', 'Thunderbolt'] },
  { id: 'cloud', name: 'Cumulus', emoji: '☁️', rarity: 1, color: '#F0F8FF', secondaryColor: '#B0C4DE', description: 'Floats wherever the wind takes it!', personality: 'sleepy', evolutions: ['Nimbus', 'Stormcloud'] },
  { id: 'star', name: 'Twinkle', emoji: '⭐', rarity: 1, color: '#FFFACD', secondaryColor: '#FFD700', description: 'Shines brightest at night!', personality: 'playful', evolutions: ['Starlet', 'Supernova'] },

  // ============ UNCOMMON (25%) - 8 pets ============
  { id: 'fox', name: 'Fox Kit', emoji: '🦊', rarity: 2, color: '#FF7F50', secondaryColor: '#FF4500', description: 'Clever and curious!', personality: 'playful', evolutions: ['Foxfire', 'Ninetail'] },
  { id: 'bunny', name: 'Bunbun', emoji: '🐰', rarity: 2, color: '#FFB6C1', secondaryColor: '#FF69B4', description: 'Loves carrots and cuddles!', personality: 'hungry', evolutions: ['Hopster', 'Moonrabbit'] },
  { id: 'chick', name: 'Chicky', emoji: '🐤', rarity: 2, color: '#FFD700', secondaryColor: '#FFA500', description: 'Cheerful chirps all day!', personality: 'energetic', evolutions: ['Roostlet', 'Goldhen'] },
  { id: 'puppy', name: 'Wooflet', emoji: '🐕', rarity: 2, color: '#DEB887', secondaryColor: '#8B4513', description: 'Your most loyal companion!', personality: 'playful', evolutions: ['Goodboy', 'Cerberus Jr'] },
  { id: 'kitten', name: 'Mewsy', emoji: '🐱', rarity: 2, color: '#FFE4E1', secondaryColor: '#FFA07A', description: 'Purrs like a tiny motor!', personality: 'sleepy', evolutions: ['Whiskers', 'Catmancer'] },
  { id: 'snowman', name: 'Frosty', emoji: '⛄', rarity: 2, color: '#FFFFFF', secondaryColor: '#E0FFFF', description: 'Never melts!', personality: 'clean', evolutions: ['Snowpal', 'Blizzard'] },
  { id: 'mushroom', name: 'Shroomy', emoji: '🍄', rarity: 2, color: '#FF6347', secondaryColor: '#8B0000', description: 'Loves dark cozy places!', personality: 'sleepy', evolutions: ['Funguy', 'Sporeling'] },
  { id: 'bee', name: 'Buzzy', emoji: '🐝', rarity: 2, color: '#FFD700', secondaryColor: '#000000', description: 'Busy busy busy!', personality: 'energetic', evolutions: ['Honeybee', 'Queenbee'] },

  // ============ RARE (10%) - 6 pets ============
  { id: 'dragon', name: 'Drake Jr', emoji: '🐲', rarity: 3, color: '#9370DB', secondaryColor: '#4B0082', description: 'Tiny but mighty!', personality: 'energetic', evolutions: ['Wyrm', 'Elder Dragon'] },
  { id: 'spirit', name: 'Spirit Cat', emoji: '👻', rarity: 3, color: '#E6E6FA', secondaryColor: '#9370DB', description: 'Mysterious and magical!', personality: 'playful', evolutions: ['Phantom', 'Spectre Lord'] },
  { id: 'phoenix', name: 'Ember', emoji: '🔥', rarity: 3, color: '#FF4500', secondaryColor: '#FFD700', description: 'Born from flames!', personality: 'energetic', evolutions: ['Blaze', 'Phoenix'] },
  { id: 'reindeer', name: 'Rudolph Jr', emoji: '🦌', rarity: 3, color: '#8B4513', secondaryColor: '#FF0000', description: 'Nose glows on Christmas!', personality: 'playful', evolutions: ['Dasher', 'Prancer'] },
  { id: 'unicorn', name: 'Sparkle', emoji: '🦄', rarity: 3, color: '#FF69B4', secondaryColor: '#9370DB', description: 'Magical and majestic!', personality: 'clean', evolutions: ['Hornstar', 'Alicorn'] },
  { id: 'robot', name: 'Beepbot', emoji: '🤖', rarity: 3, color: '#C0C0C0', secondaryColor: '#4169E1', description: 'Beep boop, friend detected!', personality: 'playful', evolutions: ['Mech-Pal', 'Ultron Jr'] },

  // ============ EPIC (4%) - 4 pets ============
  { id: 'void', name: 'Void Walker', emoji: '🌑', rarity: 4, color: '#4B0082', secondaryColor: '#000000', description: 'From the space between stars!', personality: 'sleepy', evolutions: ['Darkstar', 'Void Lord'] },
  { id: 'crystal', name: 'Crystal Guard', emoji: '💎', rarity: 4, color: '#00CED1', secondaryColor: '#E0FFFF', description: 'Shimmers with power!', personality: 'clean', evolutions: ['Gemkeeper', 'Diamond King'] },
  { id: 'angel', name: 'Halo', emoji: '👼', rarity: 4, color: '#FFFAF0', secondaryColor: '#FFD700', description: 'Pure light and kindness!', personality: 'clean', evolutions: ['Seraph', 'Archangel'] },
  { id: 'demon', name: 'Implet', emoji: '😈', rarity: 4, color: '#8B0000', secondaryColor: '#FF4500', description: 'Mischievous but loyal!', personality: 'playful', evolutions: ['Fiend', 'Archdemon'] },

  // ============ LEGENDARY (1%) - 2 pets ============
  { id: 'cosmic', name: 'Cosmic Whale', emoji: '🐋', rarity: 5, color: '#FF00FF', secondaryColor: '#4B0082', description: 'Swims through galaxies!', personality: 'lazy', evolutions: ['Star Whale', 'Galaxy Leviathan'] },
  { id: 'ancient', name: 'Ancient One', emoji: '🗿', rarity: 5, color: '#DAA520', secondaryColor: '#8B4513', description: 'Older than time itself!', personality: 'sleepy', evolutions: ['Elder Stone', 'Eternity'] },
];

// XP required per level (increases exponentially)
export const getXpForLevel = (level: number): number => {
  return Math.floor(50 * Math.pow(1.15, level - 1));
};

// XP gained per care action
export const XP_PER_CARE = 15;
export const XP_PER_CARE_THRIVING = 25;
export const MAX_LEVEL = 50;

// Helper to calculate rewards for care actions
const calculateCareRewards = (pet: Pet) => {
  const isThriving = Object.values(pet.stats).every(s => s > 80);
  return {
    coinsEarned: 5 + (isThriving ? 10 : 0),
    xpEarned: isThriving ? XP_PER_CARE_THRIVING : XP_PER_CARE,
  };
};

// Evolution requirements
export const EVOLUTION_LEVELS = {
  teen: 10,  // Stage 2 at level 10
  adult: 25, // Stage 3 at level 25
};

export const EVOLUTION_CARE_REQUIREMENTS = {
  teen: 50,   // 50 care actions for teen evolution
  adult: 150, // 150 care actions for adult evolution
};

// Streak rewards
export const STREAK_REWARDS = [
  { day: 1, coins: 50, egg: false },
  { day: 2, coins: 75, egg: false },
  { day: 3, coins: 100, egg: false },
  { day: 4, coins: 125, egg: false },
  { day: 5, coins: 150, egg: false },
  { day: 6, coins: 175, egg: false },
  { day: 7, coins: 300, egg: true }, // Rare egg!
];

export interface LevelUpResult {
  newLevel: number;
  isMilestone: boolean; // Every 5 levels
}

export interface StreakClaimResult {
  coins: number;
  streakDay: number;
  gotEgg: boolean;
  newSpeciesId?: string;
}

export interface MiniGameScore {
  highScore: number;
  totalPlays: number;
  totalCoinsEarned: number;
  lastPlayed: number | null;
}

interface GameState {
  coins: number;
  pets: Pet[];
  activePetId: string | null;
  unlockedSpecies: string[];
  totalCareActions: number;
  lastDailyBonus: number | null;
  // Streak tracking
  loginStreak: number;
  lastStreakClaim: number | null;
  // Evolution tracking
  evolutionHistory: { petId: string; fromStage: number; toStage: number; timestamp: number }[];
  // Mini-game tracking
  miniGameWins: number;
  miniGameScores: Record<string, MiniGameScore>;
  // LOW-002 fix: Hydration state
  _hasHydrated: boolean;

  // Actions
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addPet: (speciesId: string) => Pet;
  setActivePet: (petId: string) => void;
  updatePetStats: () => void;
  feedPet: () => LevelUpResult | null;
  playWithPet: () => LevelUpResult | null;
  cleanPet: () => LevelUpResult | null;
  sleepPet: () => LevelUpResult | null;
  doGachaPull: () => PetSpecies | null;
  claimDailyStreak: () => StreakClaimResult | null;
  getActivePet: () => Pet | null;
  // Evolution
  canEvolve: (petId: string) => boolean;
  evolvePet: (petId: string) => boolean;
  getEvolutionProgress: (petId: string) => { levelReady: boolean; careReady: boolean; targetStage: EvolutionStage | null };
  // Mini-games
  recordMiniGameWin: () => void;
  playMiniGame: (gameId: string, score: number, coinsEarned: number) => void;
}

const DECAY_RATES = {
  hunger: 5,      // per hour
  happiness: 3,
  energy: 4,
  cleanliness: 2,
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to add XP and check for level up
const addXpToPet = (pet: Pet, xpAmount: number): { updatedPet: Pet; levelUpResult: LevelUpResult | null } => {
  if (pet.level >= MAX_LEVEL) {
    return { updatedPet: pet, levelUpResult: null };
  }

  let newXp = pet.xp + xpAmount;
  let newLevel = pet.level;
  let leveledUp = false;

  // Check for level ups
  while (newLevel < MAX_LEVEL && newXp >= getXpForLevel(newLevel)) {
    newXp -= getXpForLevel(newLevel);
    newLevel++;
    leveledUp = true;
  }

  const updatedPet: Pet = {
    ...pet,
    xp: newXp,
    level: newLevel,
  };

  const levelUpResult: LevelUpResult | null = leveledUp
    ? { newLevel, isMilestone: newLevel % 5 === 0 }
    : null;

  return { updatedPet, levelUpResult };
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      coins: 200, // Starting coins for first gacha pull
      pets: [],
      activePetId: null,
      unlockedSpecies: [],
      totalCareActions: 0,
      lastDailyBonus: null,
      loginStreak: 0,
      lastStreakClaim: null,
      evolutionHistory: [],
      miniGameWins: 0,
      miniGameScores: {},
      _hasHydrated: false,

      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

      spendCoins: (amount) => {
        const state = get();
        if (state.coins >= amount) {
          set({ coins: state.coins - amount });
          return true;
        }
        return false;
      },

      addPet: (speciesId) => {
        const species = PET_SPECIES.find(s => s.id === speciesId);
        if (!species) throw new Error('Unknown species');

        const newPet: Pet = {
          id: generateId(),
          speciesId,
          name: species.name,
          level: 1,
          xp: 0,
          evolutionStage: 1,
          stats: {
            hunger: 80,
            happiness: 80,
            energy: 80,
            cleanliness: 80,
          },
          lastUpdated: Date.now(),
          totalCareReceived: 0,
        };

        set((state) => ({
          pets: [...state.pets, newPet],
          activePetId: state.activePetId || newPet.id,
          unlockedSpecies: state.unlockedSpecies.includes(speciesId)
            ? state.unlockedSpecies
            : [...state.unlockedSpecies, speciesId],
        }));

        return newPet;
      },

      setActivePet: (petId) => set({ activePetId: petId }),

      updatePetStats: () => {
        const state = get();
        const now = Date.now();

        // MEDIUM-001 fix: Only update pets if meaningful time has passed
        const MIN_UPDATE_HOURS = 0.01; // ~36 seconds minimum between updates

        const updatedPets = state.pets.map(pet => {
          const hoursPassed = (now - pet.lastUpdated) / (1000 * 60 * 60);

          // Skip update if not enough time has passed
          if (hoursPassed < MIN_UPDATE_HOURS) {
            return pet; // Return existing pet object, no re-render
          }

          return {
            ...pet,
            stats: {
              hunger: Math.max(0, pet.stats.hunger - (DECAY_RATES.hunger * hoursPassed)),
              happiness: Math.max(0, pet.stats.happiness - (DECAY_RATES.happiness * hoursPassed)),
              energy: Math.max(0, pet.stats.energy - (DECAY_RATES.energy * hoursPassed)),
              cleanliness: Math.max(0, pet.stats.cleanliness - (DECAY_RATES.cleanliness * hoursPassed)),
            },
            lastUpdated: now,
          };
        });

        set({ pets: updatedPets });
      },

      feedPet: () => {
        const state = get();
        const pet = state.pets.find(p => p.id === state.activePetId);
        if (!pet) return null;

        const { coinsEarned, xpEarned } = calculateCareRewards(pet);

        const updatedPetWithStats: Pet = {
          ...pet,
          stats: { ...pet.stats, hunger: Math.min(100, pet.stats.hunger + 30) },
          lastUpdated: Date.now(),
          totalCareReceived: pet.totalCareReceived + 1,
        };

        const { updatedPet, levelUpResult } = addXpToPet(updatedPetWithStats, xpEarned);

        set((state) => ({
          pets: state.pets.map(p => p.id === state.activePetId ? updatedPet : p),
          coins: state.coins + coinsEarned,
          totalCareActions: state.totalCareActions + 1,
        }));

        return levelUpResult;
      },

      playWithPet: () => {
        const state = get();
        const pet = state.pets.find(p => p.id === state.activePetId);
        if (!pet) return null;

        const { coinsEarned, xpEarned } = calculateCareRewards(pet);

        const updatedPetWithStats: Pet = {
          ...pet,
          stats: {
            ...pet.stats,
            happiness: Math.min(100, pet.stats.happiness + 25),
            energy: Math.max(0, pet.stats.energy - 10),
          },
          lastUpdated: Date.now(),
          totalCareReceived: pet.totalCareReceived + 1,
        };

        const { updatedPet, levelUpResult } = addXpToPet(updatedPetWithStats, xpEarned);

        set((state) => ({
          pets: state.pets.map(p => p.id === state.activePetId ? updatedPet : p),
          coins: state.coins + coinsEarned,
          totalCareActions: state.totalCareActions + 1,
        }));

        return levelUpResult;
      },

      cleanPet: () => {
        const state = get();
        const pet = state.pets.find(p => p.id === state.activePetId);
        if (!pet) return null;

        const { coinsEarned, xpEarned } = calculateCareRewards(pet);

        const updatedPetWithStats: Pet = {
          ...pet,
          stats: { ...pet.stats, cleanliness: Math.min(100, pet.stats.cleanliness + 35) },
          lastUpdated: Date.now(),
          totalCareReceived: pet.totalCareReceived + 1,
        };

        const { updatedPet, levelUpResult } = addXpToPet(updatedPetWithStats, xpEarned);

        set((state) => ({
          pets: state.pets.map(p => p.id === state.activePetId ? updatedPet : p),
          coins: state.coins + coinsEarned,
          totalCareActions: state.totalCareActions + 1,
        }));

        return levelUpResult;
      },

      sleepPet: () => {
        const state = get();
        const pet = state.pets.find(p => p.id === state.activePetId);
        if (!pet) return null;

        const { coinsEarned, xpEarned } = calculateCareRewards(pet);

        const updatedPetWithStats: Pet = {
          ...pet,
          stats: { ...pet.stats, energy: Math.min(100, pet.stats.energy + 40) },
          lastUpdated: Date.now(),
          totalCareReceived: pet.totalCareReceived + 1,
        };

        const { updatedPet, levelUpResult } = addXpToPet(updatedPetWithStats, xpEarned);

        set((state) => ({
          pets: state.pets.map(p => p.id === state.activePetId ? updatedPet : p),
          coins: state.coins + coinsEarned,
          totalCareActions: state.totalCareActions + 1,
        }));

        return levelUpResult;
      },

      doGachaPull: () => {
        const state = get();
        if (!state.spendCoins(100)) return null;

        // Weighted random selection
        const roll = Math.random() * 100;
        let rarity: number;
        if (roll < 60) rarity = 1;       // Common 60%
        else if (roll < 85) rarity = 2;  // Uncommon 25%
        else if (roll < 95) rarity = 3;  // Rare 10%
        else if (roll < 99) rarity = 4;  // Epic 4%
        else rarity = 5;                  // Legendary 1%

        let possiblePets = PET_SPECIES.filter(p => p.rarity === rarity);

        // Fallback to common if no pets at the rolled rarity (safety check)
        if (possiblePets.length === 0) {
          possiblePets = PET_SPECIES.filter(p => p.rarity === 1);
          if (possiblePets.length === 0) {
            // Refund coins if somehow no pets exist
            set((s) => ({ coins: s.coins + 100 }));
            return null;
          }
        }

        const species = possiblePets[Math.floor(Math.random() * possiblePets.length)];

        get().addPet(species.id);
        return species;
      },

      claimDailyStreak: () => {
        const state = get();
        const now = Date.now();
        const lastClaim = state.lastStreakClaim;
        const oneDayMs = 24 * 60 * 60 * 1000;
        const twoDaysMs = 48 * 60 * 60 * 1000;

        // Already claimed today
        if (lastClaim && (now - lastClaim) < oneDayMs) {
          return null;
        }

        let newStreak = state.loginStreak;

        // Check if streak continues or resets
        if (lastClaim) {
          const timeSinceLastClaim = now - lastClaim;
          if (timeSinceLastClaim >= twoDaysMs) {
            // Missed a day, reset streak
            newStreak = 1;
          } else {
            // Within window, increment streak
            newStreak = (newStreak % 7) + 1; // Cycle 1-7
          }
        } else {
          // First ever claim
          newStreak = 1;
        }

        const reward = STREAK_REWARDS[newStreak - 1];
        let newSpeciesId: string | undefined;

        // Add coins
        set((state) => ({
          coins: state.coins + reward.coins,
          loginStreak: newStreak,
          lastStreakClaim: now,
          lastDailyBonus: now, // Keep backward compatibility
        }));

        // Give rare egg on day 7
        if (reward.egg) {
          const rarePets = PET_SPECIES.filter(p => p.rarity === 3);
          const randomRarePet = rarePets[Math.floor(Math.random() * rarePets.length)];
          const newPet = get().addPet(randomRarePet.id);
          newSpeciesId = newPet.speciesId;
        }

        return {
          coins: reward.coins,
          streakDay: newStreak,
          gotEgg: reward.egg,
          newSpeciesId,
        };
      },

      getActivePet: () => {
        const state = get();
        return state.pets.find(p => p.id === state.activePetId) || null;
      },

      // Evolution methods
      canEvolve: (petId) => {
        const state = get();
        const pet = state.pets.find(p => p.id === petId);
        if (!pet) return false;

        // Already at max evolution
        if (pet.evolutionStage >= 3) return false;

        const progress = get().getEvolutionProgress(petId);
        return progress.levelReady && progress.careReady;
      },

      evolvePet: (petId) => {
        const state = get();
        const pet = state.pets.find(p => p.id === petId);
        if (!pet) return false;

        if (!get().canEvolve(petId)) return false;

        const newStage = (pet.evolutionStage + 1) as EvolutionStage;
        const species = PET_SPECIES.find(s => s.id === pet.speciesId);

        // Get the new name based on evolution stage
        let newName = pet.name;
        if (species?.evolutions) {
          if (newStage === 2) newName = species.evolutions[0];
          if (newStage === 3) newName = species.evolutions[1];
        }

        set((state) => ({
          pets: state.pets.map(p =>
            p.id === petId
              ? { ...p, evolutionStage: newStage, name: newName }
              : p
          ),
          evolutionHistory: [
            ...state.evolutionHistory,
            { petId, fromStage: pet.evolutionStage, toStage: newStage, timestamp: Date.now() }
          ],
        }));

        return true;
      },

      getEvolutionProgress: (petId) => {
        const state = get();
        const pet = state.pets.find(p => p.id === petId);

        if (!pet || pet.evolutionStage >= 3) {
          return { levelReady: false, careReady: false, targetStage: null };
        }

        const targetStage = (pet.evolutionStage + 1) as EvolutionStage;
        const requiredLevel = targetStage === 2 ? EVOLUTION_LEVELS.teen : EVOLUTION_LEVELS.adult;
        const requiredCare = targetStage === 2 ? EVOLUTION_CARE_REQUIREMENTS.teen : EVOLUTION_CARE_REQUIREMENTS.adult;

        return {
          levelReady: pet.level >= requiredLevel,
          careReady: pet.totalCareReceived >= requiredCare,
          targetStage,
        };
      },

      recordMiniGameWin: () => {
        set((state) => ({ miniGameWins: state.miniGameWins + 1 }));
      },

      playMiniGame: (gameId, score, coinsEarned) => {
        set((state) => {
          const existingScore = state.miniGameScores[gameId] || {
            highScore: 0,
            totalPlays: 0,
            totalCoinsEarned: 0,
            lastPlayed: null,
          };

          const newScore: MiniGameScore = {
            highScore: Math.max(existingScore.highScore, score),
            totalPlays: existingScore.totalPlays + 1,
            totalCoinsEarned: existingScore.totalCoinsEarned + coinsEarned,
            lastPlayed: Date.now(),
          };

          return {
            miniGameScores: {
              ...state.miniGameScores,
              [gameId]: newScore,
            },
            miniGameWins: state.miniGameWins + (coinsEarned > 0 ? 1 : 0),
          };
        });
      },
    }),
    {
      name: 'petplay-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try {
            return safeLocalStorage.getItem(name)
          } catch (error) {
            if (error instanceof StorageError) {
              showStorageError(error, 'gameStore.getItem')
            }
            return null
          }
        },
        setItem: (name, value) => {
          try {
            safeLocalStorage.setItem(name, value)
          } catch (error) {
            if (error instanceof StorageError) {
              showStorageError(error, 'gameStore.setItem')
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
          console.error('Failed to load saved data:', error)
          showStorageError(
            new StorageError('Saved data could not be loaded', 'corrupted'),
            'gameStore.rehydrate'
          )
        }

        // Warn user if localStorage is unavailable
        if (!isStorageAvailable()) {
          console.warn('localStorage is not available - progress will not be saved')
          const event = new CustomEvent('storage-error', {
            detail: 'Storage is disabled. Your progress will not be saved.'
          })
          window.dispatchEvent(event)
        } else if (state) {
          if (import.meta.env.DEV) console.log('Game data loaded successfully')
        }

        // LOW-002 fix: Mark store as hydrated
        useGameStore.setState({ _hasHydrated: true })
      },
    }
  )
);
