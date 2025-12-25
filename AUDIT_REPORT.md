# Hatchlings Code Quality Audit Report

**Audit Date:** 2025-12-25
**Auditor:** Claude Code Agent
**Project Path:** /media/nation/HomeLab1TB/pet-play/

---

## Executive Summary

**Files Audited:** 12
**Issues Found:** 23
- Critical: 2
- High: 6
- Medium: 9
- Low: 6

---

## Issues by Category

### 1. TypeScript Errors

**No TypeScript compilation errors found.** The codebase compiles cleanly.

---

### 2. ESLint / React Hooks Violations

#### CRITICAL-001: setState Called Synchronously in useEffect
**File:** `/media/nation/HomeLab1TB/pet-play/src/components/PetDisplay.tsx`
**Lines:** 14-27, 30-34
**Severity:** Critical
**Description:** Calling `setState` synchronously within useEffect triggers cascading renders. The emotion calculation should use `useMemo` instead, and the animation state should be derived or use a ref.

```tsx
// Lines 14-27 - Current problematic code
useEffect(() => {
  const { hunger, happiness, energy, cleanliness } = pet.stats
  const avgStat = (hunger + happiness + energy + cleanliness) / 4
  if (avgStat > 80) {
    setEmotion('happy')  // BAD: setState in effect
  }
  // ...
}, [pet.stats])
```

**Suggested Fix:** Convert to `useMemo`:
```tsx
const emotion = useMemo(() => {
  const { hunger, happiness, energy, cleanliness } = pet.stats
  const avgStat = (hunger + happiness + energy + cleanliness) / 4
  if (avgStat > 80) return 'happy'
  if (energy < 30) return 'sleepy'
  if (avgStat < 40) return 'sad'
  return 'normal'
}, [pet.stats])
```

---

#### CRITICAL-002: setState Called Synchronously in useEffect
**File:** `/media/nation/HomeLab1TB/pet-play/src/components/Snowflakes.tsx`
**Lines:** 14-27
**Severity:** Critical
**Description:** Snowflakes are generated in useEffect and then setState is called. This pattern should use `useState` with an initializer function instead.

```tsx
// Current problematic code
useEffect(() => {
  const flakes: Snowflake[] = []
  // ... generate flakes
  setSnowflakes(flakes)  // BAD
}, [])
```

**Suggested Fix:** Use lazy initial state:
```tsx
const [snowflakes] = useState<Snowflake[]>(() => {
  const flakes: Snowflake[] = []
  for (let i = 0; i < 30; i++) {
    flakes.push({ /* ... */ })
  }
  return flakes
})
```

---

#### HIGH-001: Missing Dependency in useEffect
**File:** `/media/nation/HomeLab1TB/pet-play/src/App.tsx`
**Line:** 32
**Severity:** High
**Description:** The `claimDailyBonus` function is missing from the useEffect dependency array. This could cause stale closure issues.

```tsx
useEffect(() => {
  const bonus = claimDailyBonus()  // claimDailyBonus not in deps
  // ...
}, [])  // Missing claimDailyBonus
```

**Suggested Fix:** Add to dependency array or use useRef for one-time execution:
```tsx
const hasClaimedRef = useRef(false)
useEffect(() => {
  if (hasClaimedRef.current) return
  hasClaimedRef.current = true
  const bonus = claimDailyBonus()
  // ...
}, [claimDailyBonus])
```

---

### 3. Missing Error Handling

#### HIGH-002: No Error Handling for localStorage
**File:** `/media/nation/HomeLab1TB/pet-play/src/stores/gameStore.ts`
**Lines:** 83-285
**Severity:** High
**Description:** The zustand persist middleware uses localStorage but has no error handling for:
- localStorage being disabled/unavailable
- Quota exceeded errors
- Corrupted stored data

**Suggested Fix:** Add error handling via persist middleware options:
```tsx
persist(
  (set, get) => ({ /* store */ }),
  {
    name: 'petplay-storage',
    onRehydrateStorage: () => (state, error) => {
      if (error) {
        console.error('Failed to load saved data:', error)
      }
    }
  }
)
```

---

#### HIGH-003: Unhandled Null Species in doGachaPull
**File:** `/media/nation/HomeLab1TB/pet-play/src/stores/gameStore.ts`
**Lines:** 255-256
**Severity:** High
**Description:** If `possiblePets` array is empty (no species match the rarity), `species` will be undefined, and `get().addPet(species.id)` will throw.

```tsx
const possiblePets = PET_SPECIES.filter(p => p.rarity === rarity)
const species = possiblePets[Math.floor(Math.random() * possiblePets.length)]
// species could be undefined if possiblePets is empty
get().addPet(species.id)  // Will throw if species is undefined
```

**Suggested Fix:** Add guard:
```tsx
const possiblePets = PET_SPECIES.filter(p => p.rarity === rarity)
if (possiblePets.length === 0) {
  // Fallback to common
  const commons = PET_SPECIES.filter(p => p.rarity === 1)
  if (commons.length === 0) return null
  species = commons[Math.floor(Math.random() * commons.length)]
} else {
  species = possiblePets[Math.floor(Math.random() * possiblePets.length)]
}
```

---

### 4. Memory Leaks / Cleanup Issues

#### HIGH-004: Timeout Not Cleared on Unmount
**File:** `/media/nation/HomeLab1TB/pet-play/src/components/ActionButtons.tsx`
**Lines:** 17
**Severity:** High
**Description:** `setTimeout` in `handleClick` is not cleaned up if component unmounts during the 200ms timeout.

```tsx
const handleClick = () => {
  setIsPressed(true)
  onClick()
  setTimeout(() => setIsPressed(false), 200)  // No cleanup
}
```

**Suggested Fix:** Use useRef to track and clear timeout:
```tsx
const timeoutRef = useRef<number | null>(null)

useEffect(() => {
  return () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }
}, [])

const handleClick = () => {
  setIsPressed(true)
  onClick()
  if (timeoutRef.current) clearTimeout(timeoutRef.current)
  timeoutRef.current = window.setTimeout(() => setIsPressed(false), 200)
}
```

---

#### HIGH-005: Multiple Timeouts Without Cleanup
**File:** `/media/nation/HomeLab1TB/pet-play/src/components/GachaModal.tsx`
**Lines:** 23-34
**Severity:** High
**Description:** Nested `setTimeout` calls in `handlePull` have no cleanup. If user closes modal during animation, state updates will attempt on unmounted component.

```tsx
setTimeout(() => {
  const species = doGachaPull()
  if (species) {
    setResult(species)
    setTimeout(() => {  // Nested timeout, no cleanup
      setShowResult(true)
      setIsRolling(false)
    }, 100)
  }
}, 1500)
```

**Suggested Fix:** Track timeouts with refs and clean up on unmount.

---

### 5. Performance Issues

#### MEDIUM-001: Unnecessary Re-renders from Object Creation
**File:** `/media/nation/HomeLab1TB/pet-play/src/stores/gameStore.ts`
**Lines:** 140-156
**Severity:** Medium
**Description:** `updatePetStats` creates new pet objects even when no stats have changed, causing unnecessary re-renders.

**Suggested Fix:** Add early return if no time has passed or changes are minimal:
```tsx
if (hoursPassed < 0.01) return  // Less than ~30 seconds
```

---

#### MEDIUM-002: Inline Style Objects Created Every Render
**File:** `/media/nation/HomeLab1TB/pet-play/src/components/PetDisplay.tsx`
**Lines:** 68, 74-76, 82-85
**Severity:** Medium
**Description:** Style objects are created inline on every render. Should use useMemo for expensive style calculations.

---

#### MEDIUM-003: Animation Trigger on Every Stats Change
**File:** `/media/nation/HomeLab1TB/pet-play/src/components/PetDisplay.tsx`
**Lines:** 30-34
**Severity:** Medium
**Description:** Animation triggers on any stats object change, even when values are similar. The stats object reference changes on every `updatePetStats` call.

---

### 6. Accessibility Issues

#### HIGH-006: No Keyboard Navigation for Modal Close
**File:** `/media/nation/HomeLab1TB/pet-play/src/components/GachaModal.tsx`
**Lines:** 48-52
**Severity:** High
**Description:** Modal does not close on Escape key press, violating accessibility standards.

**Suggested Fix:** Add keyboard handler:
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }
  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [onClose])
```

---

#### MEDIUM-004: Missing ARIA Labels on Icon Buttons
**File:** `/media/nation/HomeLab1TB/pet-play/src/components/Header.tsx`
**Lines:** 24-33
**Severity:** Medium
**Description:** Collection button uses emoji only with no accessible label.

**Suggested Fix:** Add `aria-label`:
```tsx
<button
  aria-label={`View collection (${pets.length} pets)`}
  // ...
>
```

---

#### MEDIUM-005: Missing Focus Trap in Modals
**Files:** `GachaModal.tsx`, `CollectionModal.tsx`
**Severity:** Medium
**Description:** Modals don't trap focus, allowing users to tab to elements behind the modal.

---

#### MEDIUM-006: No Reduced Motion Support
**File:** `/media/nation/HomeLab1TB/pet-play/src/index.css`
**Severity:** Medium
**Description:** Animations don't respect `prefers-reduced-motion` media query. Users who have motion sensitivity may be uncomfortable.

**Suggested Fix:** Add to CSS:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 7. Security Concerns

#### MEDIUM-007: No Input Validation on Pet Names
**File:** `/media/nation/HomeLab1TB/pet-play/src/stores/gameStore.ts`
**Lines:** 104-132
**Severity:** Medium
**Description:** Pet names come from predefined species, but if future features allow custom naming, there's no sanitization. Currently low risk since names are hardcoded.

---

#### LOW-001: Console Logging in Production
**Files:** `App.tsx`, `feedback.ts`
**Severity:** Low
**Description:** `console.log` statements for daily bonus and sound effects will appear in production builds.

---

### 8. Code Duplication

#### MEDIUM-008: Repeated Thriving Check Logic
**File:** `/media/nation/HomeLab1TB/pet-play/src/stores/gameStore.ts`
**Lines:** 163, 182, 209, 228
**Severity:** Medium
**Description:** The "isThriving" check and coin bonus logic is duplicated in `feedPet`, `playWithPet`, `cleanPet`, and `sleepPet`.

```tsx
// Repeated in 4 places:
const isThriving = Object.values(pet.stats).every(s => s > 80)
const coinsEarned = 5 + (isThriving ? 10 : 0)
```

**Suggested Fix:** Extract to helper function:
```tsx
const calculateCareCoins = (pet: Pet) => {
  const isThriving = Object.values(pet.stats).every(s => s > 80)
  return 5 + (isThriving ? 10 : 0)
}
```

---

#### MEDIUM-009: Repeated Modal Backdrop Pattern
**Files:** `GachaModal.tsx`, `CollectionModal.tsx`
**Severity:** Medium
**Description:** Both modals have identical backdrop and click-outside-to-close logic. Should be extracted to a reusable Modal component.

---

### 9. Missing Loading/Error States

#### LOW-002: No Loading State for Store Hydration
**File:** `/media/nation/HomeLab1TB/pet-play/src/App.tsx`
**Severity:** Low
**Description:** When the app loads, there's a brief moment where zustand's persist middleware is hydrating from localStorage. During this time, `pets.length === 0` shows the StarterPicker incorrectly for returning users.

**Suggested Fix:** Check hydration state before rendering.

---

#### LOW-003: No Error Boundary
**File:** `/media/nation/HomeLab1TB/pet-play/src/main.tsx`
**Severity:** Low
**Description:** App has no error boundary to catch and display errors gracefully.

---

#### LOW-004: No Feedback on Action Failure
**File:** `/media/nation/HomeLab1TB/pet-play/src/components/ActionButtons.tsx`
**Severity:** Low
**Description:** If care actions fail silently (e.g., no active pet), user gets no feedback.

---

### 10. Unused Code / Dead Props

#### LOW-005: Unused `onOpenGacha` Prop
**File:** `/media/nation/HomeLab1TB/pet-play/src/components/Header.tsx`
**Line:** 8
**Severity:** Low
**Description:** `onOpenGacha` is defined in props but never used. Only `onOpenCollection` is used.

```tsx
export default function Header({ onOpenCollection }: HeaderProps) {
  // onOpenGacha is destructured in interface but not used
```

---

#### LOW-006: Duplicate Import
**File:** `/media/nation/HomeLab1TB/pet-play/src/App.tsx`
**Lines:** 1, 11
**Severity:** Low
**Description:** `./index.css` is imported in both `main.tsx` (line 3) and `App.tsx` (line 11). Redundant import.

---

## Summary Table

| ID | Severity | Category | File | Description |
|----|----------|----------|------|-------------|
| CRITICAL-001 | Critical | React Hooks | PetDisplay.tsx | setState in useEffect (emotion) |
| CRITICAL-002 | Critical | React Hooks | Snowflakes.tsx | setState in useEffect (snowflakes) |
| HIGH-001 | High | React Hooks | App.tsx | Missing dependency in useEffect |
| HIGH-002 | High | Error Handling | gameStore.ts | No localStorage error handling |
| HIGH-003 | High | Error Handling | gameStore.ts | Unhandled null species in gacha |
| HIGH-004 | High | Memory Leak | ActionButtons.tsx | Timeout not cleared |
| HIGH-005 | High | Memory Leak | GachaModal.tsx | Multiple timeouts without cleanup |
| HIGH-006 | High | Accessibility | GachaModal.tsx | No Escape key to close |
| MEDIUM-001 | Medium | Performance | gameStore.ts | Unnecessary re-renders |
| MEDIUM-002 | Medium | Performance | PetDisplay.tsx | Inline style objects |
| MEDIUM-003 | Medium | Performance | PetDisplay.tsx | Animation over-trigger |
| MEDIUM-004 | Medium | Accessibility | Header.tsx | Missing ARIA labels |
| MEDIUM-005 | Medium | Accessibility | Modals | No focus trap |
| MEDIUM-006 | Medium | Accessibility | index.css | No reduced motion support |
| MEDIUM-007 | Medium | Security | gameStore.ts | No input validation |
| MEDIUM-008 | Medium | Code Duplication | gameStore.ts | Repeated thriving logic |
| MEDIUM-009 | Medium | Code Duplication | Modals | Repeated backdrop pattern |
| LOW-001 | Low | Best Practice | Multiple | Console logging in production |
| LOW-002 | Low | Loading State | App.tsx | No hydration loading state |
| LOW-003 | Low | Error Handling | main.tsx | No error boundary |
| LOW-004 | Low | UX | ActionButtons.tsx | No action failure feedback |
| LOW-005 | Low | Dead Code | Header.tsx | Unused onOpenGacha prop |
| LOW-006 | Low | Dead Code | App.tsx | Duplicate CSS import |

---

## Fixes Applied

The following critical and high severity issues have been fixed directly in the codebase:

1. **CRITICAL-001:** Converted emotion state to `useMemo` in PetDisplay.tsx
2. **CRITICAL-002:** Converted snowflakes to lazy initial state in Snowflakes.tsx
3. **HIGH-001:** Fixed dependency array in App.tsx using useRef pattern
4. **HIGH-003:** Added null check for species in gameStore.ts doGachaPull
5. **HIGH-004:** Added timeout cleanup in ActionButtons.tsx
6. **HIGH-005:** Added timeout cleanup refs in GachaModal.tsx
7. **HIGH-006:** Added Escape key handler in GachaModal.tsx

---

## Recommendations

1. **Add Error Boundary:** Wrap App with React Error Boundary component
2. **Extract Modal Component:** Create reusable Modal with focus trap, ESC handling
3. **Add Loading State:** Check zustand hydration before rendering
4. **Reduce Motion:** Add CSS media query for motion-sensitive users
5. **Extract Helper Functions:** DRY up the thriving check logic
6. **Remove Unused Props:** Clean up Header component interface
7. **Add Accessibility:** ARIA labels, focus management, screen reader support

---

*End of Audit Report*
