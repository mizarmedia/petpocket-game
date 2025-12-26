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

// SVG Icons - clean, professional look
const HungerIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05l-5 2v5.12c0 .6-.4 1.1-.98 1.2-.58.1-1.14-.27-1.32-.83L14.31 8.3l-.95.55c-.47.28-.76.78-.76 1.33v10.8c0 1.1.9 2 2 2h3.46zM1 21.99h7c1.1 0 2-.9 2-2v-9c0-.55-.23-1.07-.62-1.45-.4-.38-.94-.58-1.49-.53l-5.22.53c-.94.09-1.67.87-1.67 1.82v8.62c0 1.1.9 2.01 2 2.01zm0-11.99c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0-5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
  </svg>
)

const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
)

const BoltIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"/>
  </svg>
)

const SparkleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 2L9.19 8.62 2 9.24l5.45 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2z"/>
  </svg>
)

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
          icon={<HungerIcon />}
          label="Hunger"
          value={stats.hunger}
          colorClass="stat-hunger"
        />
        <StatBar
          icon={<HeartIcon />}
          label="Happiness"
          value={stats.happiness}
          colorClass="stat-happiness"
        />
        <StatBar
          icon={<BoltIcon />}
          label="Energy"
          value={stats.energy}
          colorClass="stat-energy"
        />
        <StatBar
          icon={<SparkleIcon />}
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
