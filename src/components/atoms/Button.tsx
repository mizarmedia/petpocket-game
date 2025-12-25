import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  fullWidth?: boolean
  isLoading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-br from-kawaii-pink via-kawaii-rose to-kawaii-peach text-white shadow-kawaii hover:shadow-kawaii-lg',
  secondary: 'bg-gradient-to-br from-kawaii-sky via-kawaii-lavender to-kawaii-lilac text-white shadow-kawaii hover:shadow-kawaii-lg',
  success: 'bg-gradient-to-br from-kawaii-mint via-kawaii-sky to-kawaii-mint text-white shadow-soft-lg hover:shadow-kawaii',
  danger: 'bg-gradient-to-br from-red-400 via-pink-400 to-red-400 text-white shadow-soft-lg hover:shadow-kawaii',
  ghost: 'bg-white/80 backdrop-blur-sm text-gray-700 shadow-soft hover:shadow-soft-lg border-2 border-kawaii-pink/30 hover:border-kawaii-pink/50',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-kawaii',
  md: 'px-6 py-3 text-base rounded-kawaii-lg',
  lg: 'px-8 py-4 text-lg rounded-kawaii-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  isLoading = false,
  disabled,
  className = '',
  onClick,
  ...props
}: ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick && !disabled && !isLoading) {
      // Add haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
      onClick(e)
    }
  }

  return (
    <button
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        font-semibold
        transition-all duration-200
        active:scale-95
        hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        transform
        ${!disabled && !isLoading ? 'animate-bounce-soft hover:animate-none' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}
