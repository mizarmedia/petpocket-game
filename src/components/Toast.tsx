import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react'
import { CoinIcon, SparkleIcon, InfoIcon, WarningIcon } from './ui/Icons'

// Toast types
export type ToastType = 'coins' | 'success' | 'info' | 'warning' | 'error'

export interface Toast {
  id: number
  message: string
  type: ToastType
  icon?: ReactNode
  duration?: number
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, icon?: string, duration?: number) => void
  showCoins: (amount: number) => void
  showSuccess: (message: string) => void
  showInfo: (message: string) => void
  showError: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast item component
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const duration = toast.duration || 2500

    const exitTimer = setTimeout(() => {
      setIsExiting(true)
    }, duration - 200) // Start exit animation before removal

    const removeTimer = setTimeout(() => {
      onRemove()
    }, duration)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(removeTimer)
    }
  }, [toast.duration, onRemove])

  const getIcon = (): ReactNode => {
    if (toast.icon) return toast.icon
    switch (toast.type) {
      case 'coins': return <CoinIcon size={28} />
      case 'success': return <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      case 'info': return <InfoIcon size={28} />
      case 'warning': return <WarningIcon size={28} />
      case 'error': return <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
      default: return <SparkleIcon size={28} className="text-yellow-300" />
    }
  }

  const getGlowClass = () => {
    switch (toast.type) {
      case 'coins': return 'toast-glow-coins border-yellow-500/30'
      case 'success': return 'toast-glow-success border-green-500/30'
      case 'info': return 'toast-glow-info border-blue-500/30'
      case 'warning': return 'border-yellow-500/30'
      case 'error': return 'border-red-500/30'
      default: return ''
    }
  }

  const getGradient = () => {
    switch (toast.type) {
      case 'coins': return 'from-yellow-500/20 to-amber-500/20'
      case 'success': return 'from-green-500/20 to-emerald-500/20'
      case 'info': return 'from-blue-500/20 to-cyan-500/20'
      case 'warning': return 'from-yellow-500/20 to-orange-500/20'
      case 'error': return 'from-red-500/20 to-rose-500/20'
      default: return ''
    }
  }

  return (
    <div
      className={`fixed top-4 left-1/2 z-[100]
                 ${isExiting ? 'toast-exit' : 'toast-enter'}`}
    >
      <div className={`glass-dark rounded-2xl px-5 py-3
                      border ${getGlowClass()}
                      flex items-center gap-3
                      min-w-[200px] max-w-[90vw]`}>
        {/* Gradient background */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${getGradient()} pointer-events-none`} />

        {/* Icon */}
        <span className="text-2xl relative z-10 animate-bounce">
          {getIcon()}
        </span>

        {/* Message */}
        <span className="font-semibold text-white relative z-10 whitespace-nowrap">
          {toast.message}
        </span>
      </div>
    </div>
  )
}

// Toast provider component
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [nextId, setNextId] = useState(0)

  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    icon?: string,
    duration: number = 2500
  ) => {
    const id = nextId
    setNextId(prev => prev + 1)

    setToasts(prev => [...prev, { id, message, type, icon, duration }])
  }, [nextId])

  const showCoins = useCallback((amount: number) => {
    const sign = amount >= 0 ? '+' : ''
    showToast(`${sign}${amount} coins!`, 'coins', undefined, 2000)
  }, [showToast])

  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success', undefined, 2500)
  }, [showToast])

  const showInfo = useCallback((message: string) => {
    showToast(message, 'info', undefined, 2500)
  }, [showToast])

  const showError = useCallback((message: string) => {
    showToast(message, 'error', undefined, 3000)
  }, [showToast])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, showCoins, showSuccess, showInfo, showError }}>
      {children}

      {/* Render toasts - only show the most recent one */}
      {toasts.length > 0 && (
        <ToastItem
          key={toasts[toasts.length - 1].id}
          toast={toasts[toasts.length - 1]}
          onRemove={() => removeToast(toasts[toasts.length - 1].id)}
        />
      )}
    </ToastContext.Provider>
  )
}
