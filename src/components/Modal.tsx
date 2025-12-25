import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface ModalProps {
  onClose: () => void
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Modal({ onClose, children, maxWidth = 'sm', className = '' }: ModalProps) {
  const [modalEntered, setModalEntered] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Trigger modal entrance animation
  useEffect(() => {
    requestAnimationFrame(() => setModalEntered(true))
  }, [])

  // MEDIUM-005 fix: Focus trap - focus first focusable element on mount
  useEffect(() => {
    if (!modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusableElements[0]

    if (firstFocusable) {
      firstFocusable.focus()
    }
  }, [])

  // Handle Escape key to close modal (accessibility)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // MEDIUM-005 fix: Focus trap - keep focus within modal
  useEffect(() => {
    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstFocusable = focusableElements[0]
      const lastFocusable = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable.focus()
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable.focus()
        }
      }
    }

    document.addEventListener('keydown', handleFocusTrap)
    return () => document.removeEventListener('keydown', handleFocusTrap)
  }, [])

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }[maxWidth]

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4
                  modal-backdrop bg-black/70
                  ${modalEntered ? 'modal-backdrop-enter' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`glass-dark rounded-3xl p-6 w-full ${maxWidthClass} shadow-2xl
                   flex flex-col relative
                   ${modalEntered ? 'modal-enter' : 'translate-y-full opacity-0'}
                   ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
