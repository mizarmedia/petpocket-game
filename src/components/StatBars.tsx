interface Stats {
  hunger: number
  happiness: number
  energy: number
  cleanliness: number
}

interface StatBarsProps {
  stats: Stats
}

interface StatBarProps {
  icon: string
  label: string
  value: number
  colorClass: string
  lowColor: string
  midColor: string
  highColor: string
}

function getIconAnimation(value: number): string {
  if (value >= 70) return 'stat-icon-happy'
  if (value >= 30) return 'stat-icon-warning'
  return 'stat-icon-critical'
}

function getBarColor(value: number, lowColor: string, midColor: string, highColor: string): string {
  if (value >= 70) return highColor
  if (value >= 30) return midColor
  return lowColor
}

function StatBar({ icon, label, value, lowColor, midColor, highColor }: StatBarProps) {
  const isCritical = value < 20
  const iconAnimation = getIconAnimation(value)
  const barColor = getBarColor(value, lowColor, midColor, highColor)

  return (
    <div className="flex items-center gap-2.5">
      {/* Animated icon */}
      <div className={`w-9 h-9 rounded-xl glass flex items-center justify-center
                      ${isCritical ? 'bg-red-500/20 border border-red-500/30' : ''}`}>
        <span className={`text-lg ${iconAnimation}`}>
          {icon}
        </span>
      </div>

      {/* Bar container */}
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-300 font-medium">{label}</span>
          <span className={`font-bold tabular-nums ${
            value < 20 ? 'text-red-400' :
            value < 40 ? 'text-yellow-400' :
            'text-gray-300'
          }`}>
            {Math.round(value)}%
          </span>
        </div>

        {/* Bar track */}
        <div className="h-3.5 bg-black/40 rounded-full overflow-hidden
                        border border-white/10 shadow-inner">
          {/* Bar fill */}
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out
                       relative stat-shimmer ${isCritical ? 'stat-critical' : ''}`}
            style={{
              width: `${Math.max(0, Math.min(100, value))}%`,
              background: barColor
            }}
          >
            {/* Inner highlight */}
            <div className="absolute inset-0 rounded-full
                           bg-gradient-to-b from-white/30 to-transparent
                           pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StatBars({ stats }: StatBarsProps) {
  return (
    <div className="glass-card rounded-2xl p-4 mx-2">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <StatBar
          icon="🍖"
          label="Hunger"
          value={stats.hunger}
          colorClass="stat-hunger"
          lowColor="linear-gradient(90deg, #ef4444, #dc2626)"
          midColor="linear-gradient(90deg, #f97316, #ea580c)"
          highColor="linear-gradient(90deg, #22c55e, #16a34a)"
        />
        <StatBar
          icon="💖"
          label="Happiness"
          value={stats.happiness}
          colorClass="stat-happiness"
          lowColor="linear-gradient(90deg, #ef4444, #dc2626)"
          midColor="linear-gradient(90deg, #eab308, #ca8a04)"
          highColor="linear-gradient(90deg, #fbbf24, #f59e0b)"
        />
        <StatBar
          icon="⚡"
          label="Energy"
          value={stats.energy}
          colorClass="stat-energy"
          lowColor="linear-gradient(90deg, #ef4444, #dc2626)"
          midColor="linear-gradient(90deg, #84cc16, #65a30d)"
          highColor="linear-gradient(90deg, #22c55e, #16a34a)"
        />
        <StatBar
          icon="✨"
          label="Clean"
          value={stats.cleanliness}
          colorClass="stat-cleanliness"
          lowColor="linear-gradient(90deg, #ef4444, #dc2626)"
          midColor="linear-gradient(90deg, #0ea5e9, #0284c7)"
          highColor="linear-gradient(90deg, #3b82f6, #2563eb)"
        />
      </div>

      {/* Warning message for critical stats */}
      {Object.values(stats).some(v => v < 20) && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-red-400 text-xs animate-pulse">
            <span>!</span>
            <span>Your pet needs attention!</span>
          </div>
        </div>
      )}
    </div>
  )
}
