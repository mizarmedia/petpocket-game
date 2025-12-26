# FEAT-001: Daily Login Rewards

**Severity:** HIGH
**Status:** Open
**Type:** Feature
**Created:** 2025-12-25 23:49

## Description
Add a daily login reward system to increase engagement. Users should get rewards for logging in each day, with streak bonuses.

## Requirements
- Show reward popup on first login each day
- Give coins/snowflakes as daily reward
- Track login streak (consecutive days)
- Bonus rewards for streaks (7 days = rare egg, 30 days = epic egg)
- Visual streak counter somewhere visible
- Satisfying animation when claiming

## Files to Modify
- src/stores/gameStore.ts - Add lastLoginDate, loginStreak fields
- src/components/DailyRewardModal.tsx - New modal for rewards
- src/App.tsx - Check and show reward on load
