# PetPocket - Mission: Make It AMAZING

## FIRST PRIORITY: REBRAND

**"Hatchlings" is out. New name needed.**

Suggested names (Japanese/Tamagotchi/Pokemon vibes):
- **PetPocket** - clean, memorable, obvious genre
- **TamaPals** - Tamagotchi tribute
- **Mochi Pets** - cute Japanese aesthetic
- **Chibi Critters** - emphasizes cute factor
- **Pocket Spirits** - mystical angle

Pick one and update everywhere:
- `index.html` title and meta tags
- `src/components/Header.tsx`
- `src/components/StarterPicker.tsx`

---

## Art Direction: JAPANESE KAWAII

Think: Tamagotchi meets Pokemon with mobile gacha polish.

### Visual Style
- **Pixel art OR chibi style** - not realistic, CUTE
- Rounded shapes, big eyes, simple expressions
- Pastel colors with neon accents
- Screen layouts inspired by Japanese mobile games
- Sakura petals, stars, hearts as particle effects
- UI sounds: plings, pops, chimes (8-bit style)

### Reference Games
- Tamagotchi (stat management, simple care)
- Pokemon (collection, evolution, rarity)
- Neko Atsume (cozy, adorable)
- Any gacha mobile game (pull excitement)

---

## Goal
Transform this basic pet game into something that makes people say "wow". The user is trying to impress someone. Every feature must feel polished, delightful, and fun.

---

## Priority 1: VISUAL WOW FACTOR (Do First)

### Replace Emoji Pets with Animated SVG/CSS Creatures
The current pets are emojis. This needs to change ASAP.
- Create custom pet designs in chibi/pixel style
- Each pet needs: idle wobble, happy bounce, sad droop, eating nom, sleeping zzz
- Rarity visually obvious:
  - Common: simple, solid colors
  - Uncommon: sparkle effect
  - Rare: glow aura
  - Epic: floating particles
  - Legendary: rainbow shimmer, dramatic presence
- Location: `src/components/pets/` - see PetSprite.tsx

### Pet Stage Enhancement
- Parallax background layers (sky, clouds, ground)
- Time-of-day themes (dawn pink, day blue, dusk orange, night purple)
- Floating particles:
  - Hearts when happy
  - Z's when sleepy
  - Sweat drops when hungry
  - Sparkles for rare pets
  - Sakura petals ambient
- Make it feel like a living scene

### UI Kawaii Polish
- Rounded corners EVERYWHERE
- Soft shadows, no harsh edges
- Gradient buttons (pastel to vibrant)
- Bouncy micro-animations on tap
- Japanese-inspired typography
- Glass blur on modals
- Satisfying button press feedback

---

## Priority 2: GAMEPLAY HOOKS (Engagement)

### Evolution System (Make People Want to Keep Playing)
- 3 evolution stages per pet
- Big transformation sequence (flash, particles, reveal!)
- Requirements: care quality + level milestones
- Evolution preview silhouette to build anticipation
- Path: Check gameStore.ts for pet structure

### Mini-Games Polish
- CatchGame and MemoryMatch exist - make them FUN
- Add combo systems, streaks
- Screen shake on big combos
- Point popups (+10!, +50!, COMBO!)
- Path: `src/components/games/`

### Gacha Pull Experience
- The pull moment must be EXCITING
- Slow reveal animation
- Rarity-based drama:
  - Common: quick pop
  - Rare: screen flash
  - Epic: dramatic pause, particle burst
  - Legendary: screen crack effect, rainbow explosion

### Achievement Dopamine
- Achievement unlock = celebration
- Confetti, sound, coin reward
- Progress bars toward next achievement
- Categories visible in UI

---

## Priority 3: FIX THE AUDIT ISSUES

Read AUDIT_REPORT.md - remaining issues:
- HIGH-002: localStorage error handling
- MEDIUM-001 to MEDIUM-009: Performance and accessibility
- Extract reusable Modal component with focus trap
- Add reduced motion support (@media prefers-reduced-motion)
- ARIA labels for screen readers

---

## Priority 4: EXPAND CONTENT

### Pet Collection (30+ pets)
Each with unique personality:

**Common (8)** - Easy to get, cute basics
- Blob variants (happy blob, sleepy blob, hungry blob)
- Basic animals (puppy, kitty, bunny, chick)

**Uncommon (8)** - Slightly special
- Fantasy lite (fairy, imp, sprite)
- Cool animals (fox, owl, panda)

**Rare (6)** - Getting exciting
- Dragons (fire, ice, nature)
- Mythical (baby phoenix, tiny unicorn)

**Epic (4)** - Major pulls
- Elemental spirits
- Cosmic creatures (star being, moon bunny)

**Legendary (2)** - Holy grail
- Ancient guardian
- Celestial dragon

**Seasonal (2)** - Christmas special!
- Santa Slime
- Reindeer Pup

---

## Technical Guidelines

1. **React + TypeScript + Vite + Tailwind** - stack is set
2. **Zustand** for state - see `src/stores/`
3. **60fps animations** - CSS animations preferred, no jank
4. **Mobile-first** - this IS a mobile game
5. **Touch-friendly** - big tap targets, swipe gestures

---

## Definition of "Amazing"

The game is done when:
1. First-time players smile within 10 seconds
2. Gacha pulls feel genuinely exciting
3. Pets feel alive and loveable
4. UI is buttery smooth, Japanese-cute aesthetic
5. People want to show it off to friends
6. Works perfectly on mobile
7. Has that "one more pull" addictive quality

---

## Key Files

- `src/App.tsx` - Main app, routing
- `src/stores/gameStore.ts` - All game state, pet data
- `src/stores/achievementStore.ts` - Achievement tracking
- `src/components/PetDisplay.tsx` - Pet rendering
- `src/components/pets/PetSprite.tsx` - Pet visuals (TRANSFORM THIS)
- `src/components/games/` - Mini-games
- `src/components/GachaModal.tsx` - Pull experience (MAKE EXCITING)
- `AUDIT_REPORT.md` - Known issues
- `ROADMAP_V1.md` - Full wishlist

---

## GO WILD

Work autonomously. Make decisions. Ship features. Make it KAWAII. Make it impressive. The user wants to show this off - make it worth showing.
