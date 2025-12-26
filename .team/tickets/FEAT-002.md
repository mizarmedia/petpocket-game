# FEAT-002: Pet Happiness Interactions

**Severity:** HIGH
**Status:** Open
**Type:** Feature
**Created:** 2025-12-25 23:49

## Description
Add interactive pet happiness features - tapping/petting animations, heart particles, happy sounds.

## Requirements
- Tap on pet to pet it (heart particles burst)
- Pet reacts with happy bounce animation
- Small happiness boost per pet (cooldown 30s)
- Different reactions per pet species
- Haptic feedback on tap

## Files to Modify
- src/components/PetDisplay.tsx - Add tap handler
- src/components/pets/PetSprite.tsx - Add pet reaction animation
