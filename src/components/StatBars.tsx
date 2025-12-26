import { Drumstick, Heart, Zap, Sparkles } from 'lucide-react'

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
  icon: React.ReactNode
  label: string
  value: number
  colorClass: string
}

function StatBar({ icon, label, value, colorClass }: StatBarProps) {
  const isCritical = value < 20

  return (
    <div className="flex items-center gap-2.5">
      {/* Icon container */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
                      ${isCritical
                        ? 'bg-red-500/30 border border-red-400/50 animate-pulse'
                        : 'bg-white/10 border border-white/20'}`}>
        <div className={`${isCritical ? 'text-red-300' : 'text-white/90'}`}>
          {icon}
        </div>
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
                       relative stat-shimmer ${isCritical ? 'stat-critical' : ''} ${colorClass}`}
            style={{
              width: `${Math.max(0, Math.min(100, value))}%`
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
    <div className="glass-card rounded-2xl p-4 mx-2 backdrop-blur-md bg-white/5 border border-white/10">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <StatBar
          icon={<Drumstick size={20} />}
          label="Hunger"
          value={stats.hunger}
          colorClass="stat-hunger"
        />
        <StatBar
          icon={<Heart size={20} />}
          label="Happiness"
          value={stats.happiness}
          colorClass="stat-happiness"
        />
        <StatBar
          icon={<Zap size={20} />}
          label="Energy"
          value={stats.energy}
          colorClass="stat-energy"
        />
        <StatBar
          icon={<Sparkles size={20} />}
          label="Clean"
          value={stats.cleanliness}
          colorClass="stat-cleanliness"
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
