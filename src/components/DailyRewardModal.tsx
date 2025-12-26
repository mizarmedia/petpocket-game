import { useState, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import { playSound, haptic } from '../utils/feedback'
import { CoinIcon, EggIcon, GiftIcon, FlameIcon, CelebrationIcon } from './ui/Icons'

interface DailyRewardModalProps {
  onClose: () => void
}

export default function DailyRewardModal({ onClose }: DailyRewardModalProps) {
  const { loginStreak, claimDailyStreak } = useGameStore()
  const [claimed, setClaimed] = useState(false)
  const [reward, setReward] = useState<{ coins: number; egg?: 'rare' | 'epic' } | null>(null)
  const [modalEntered, setModalEntered] = useState(false)
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string }>>([])

  useEffect(() => {
    requestAnimationFrame(() => setModalEntered(true))
  }, [])

  const handleClaim = () => {
    if (claimed) return

    playSound('tap')
    haptic('heavy')

    const claimResult = claimDailyStreak()
    if (claimResult) {
      setReward(claimResult)
      setClaimed(true)

      // Create confetti burst
      const newConfetti = []
      for (let i = 0; i < 30; i++) {
        newConfetti.push({
          id: i,
          x: Math.random() * 100,
          color: ['#fbbf24', '#f472b6', '#60a5fa', '#4ade80'][Math.floor(Math.random() * 4)]
        })
      }
      setConfetti(newConfetti)

      // Play special sound for milestones
      if (claimResult.gotEgg && claimResult.streakDay >= 30) {
        playSound('gacha_reveal_legendary')
        haptic('success')
      } else if (claimResult.gotEgg) {
        playSound('gacha_reveal_epic')
        haptic('success')
      } else {
        playSound('coin')
      }
    }
  }

  const getStreakMessage = () => {
    if (loginStreak >= 30) return "LEGENDARY STREAK!"
    if (loginStreak >= 14) return "Amazing dedication!"
    if (loginStreak >= 7) return "One week strong!"
    if (loginStreak >= 3) return "Keep it up!"
    return "Welcome back!"
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4
                  modal-backdrop bg-black/70
                  ${modalEntered ? 'modal-backdrop-enter' : 'opacity-0'}`}
      onClick={claimed ? onClose : undefined}
    >
      {/* Confetti */}
      {confetti.map(c => (
        <div
          key={c.id}
          className="confetti"
          style={{
            left: `${c.x}%`,
            top: '-10px',
            backgroundColor: c.color,
            animationDuration: `${2 + Math.random()}s`
          }}
        />
      ))}

      <div
        className={`glass-kawaii-pink rounded-kawaii-xl p-6 w-full max-w-sm shadow-kawaii-lg
                   ${modalEntered ? 'modal-enter' : 'translate-y-full opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient glow */}
        <div className="absolute inset-0 rounded-kawaii-xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/20
                       blur-xl -z-10 opacity-60" />

        <h2 className="text-3xl font-bold text-center mb-4">
          <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500
                          bg-clip-text text-transparent drop-shadow-lg animate-shimmer">
            Daily Reward!
          </span>
        </h2>

        {/* Streak counter */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500
                          rounded-full shadow-lg mb-2">
            <FlameIcon size={28} />
            <span className="text-xl font-bold text-white">{loginStreak} Day Streak!</span>
          </div>
          <p className="text-sm text-pink-200">{getStreakMessage()}</p>
        </div>

        {/* Reward display */}
        {!claimed ? (
          <div className="bg-white/10 rounded-kawaii-lg p-6 mb-6 text-center">
            <p className="text-lg mb-4">Tap to claim your reward!</p>
            <div className="animate-kawaii-bounce flex justify-center">
              {loginStreak >= 30 ? <GiftIcon size={72} /> : loginStreak >= 7 ? <EggIcon size={72} /> : <CoinIcon size={72} />}
            </div>
          </div>
        ) : (
          <div className="bg-white/10 rounded-kawaii-lg p-6 mb-6 text-center animate-pop">
            <p className="text-xl font-bold mb-3 text-yellow-400">You received!</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-center gap-2 text-2xl">
                <CoinIcon size={32} />
                <span className="font-bold text-yellow-400">+{reward?.coins} coins</span>
              </div>
              {reward?.egg && (
                <div className="flex items-center justify-center gap-2 text-2xl animate-kawaii-wiggle">
                  <EggIcon size={32} />
                  <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {reward.egg === 'epic' ? 'EPIC' : 'RARE'} Egg!
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Milestone progress */}
        <div className="mb-6">
          <p className="text-xs text-gray-400 text-center mb-2">Next milestone:</p>
          <div className="flex flex-row justify-center items-start gap-4">
            {loginStreak < 7 && (
              <div className="text-center px-4 py-3 rounded-xl bg-blue-500/20 min-w-[80px]">
                <div className="flex justify-center mb-1"><EggIcon size={32} /></div>
                <p className="text-sm font-medium text-blue-300">Day 7</p>
                <p className="text-xs text-gray-400 mt-1">{7 - loginStreak} days left</p>
              </div>
            )}
            {loginStreak < 30 && (
              <div className="text-center px-4 py-3 rounded-xl bg-purple-500/20 min-w-[80px]">
                <div className="flex justify-center mb-1"><GiftIcon size={32} /></div>
                <p className="text-sm font-medium text-purple-300">Day 30</p>
                <p className="text-xs text-gray-400 mt-1">{30 - loginStreak} days left</p>
              </div>
            )}
          </div>
        </div>

        {/* Button */}
        {!claimed ? (
          <button
            onClick={handleClaim}
            className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-600
                      rounded-kawaii-lg font-bold text-white shadow-kawaii
                      hover:scale-105 transition-transform active-kawaii-press flex items-center justify-center gap-2"
          >
            <span>Claim Reward!</span>
            <GiftIcon size={20} />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600
                      rounded-kawaii-lg font-bold text-white shadow-kawaii
                      hover:scale-105 transition-transform active-kawaii-press flex items-center justify-center gap-2"
          >
            <span>Awesome!</span>
            <CelebrationIcon size={20} />
          </button>
        )}

        {/* Skip button */}
        {!claimed && (
          <button
            onClick={onClose}
            className="w-full mt-2 py-2 text-gray-400 hover:text-white transition
                      hover:bg-white/5 rounded-kawaii"
          >
            Maybe later
          </button>
        )}
      </div>
    </div>
  )
}
