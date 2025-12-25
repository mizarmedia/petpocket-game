// Storage utilities for safer localStorage operations

export class StorageError extends Error {
  public type: 'unavailable' | 'quota' | 'corrupted' | 'unknown'

  constructor(message: string, type: 'unavailable' | 'quota' | 'corrupted' | 'unknown') {
    super(message)
    this.name = 'StorageError'
    this.type = type
  }
}

/**
 * Check if localStorage is available and working
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Show user-friendly error message for storage failures
 */
export const showStorageError = (error: Error, context: string) => {
  console.error(`Storage error in ${context}:`, error)

  let message = 'Unable to save your progress. '

  if (error instanceof StorageError) {
    switch (error.type) {
      case 'unavailable':
        message += 'Please check your browser settings and enable local storage.'
        break
      case 'quota':
        message += 'Storage is full. Try clearing some browser data.'
        break
      case 'corrupted':
        message += 'Saved data appears corrupted. Your game will start fresh.'
        break
      default:
        message += 'Please try refreshing the page.'
    }
  } else {
    message += 'Please try refreshing the page.'
  }

  // Show error to user (you can replace this with your Toast component)
  if (typeof window !== 'undefined') {
    // Try to show via toast if available
    const event = new CustomEvent('storage-error', { detail: message })
    window.dispatchEvent(event)
  }
}

/**
 * Enhanced localStorage wrapper with error handling
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (!isStorageAvailable()) {
        throw new StorageError('localStorage is not available', 'unavailable')
      }
      return localStorage.getItem(key)
    } catch (error) {
      if (error instanceof StorageError) throw error
      throw new StorageError('Failed to read from storage', 'unknown')
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      if (!isStorageAvailable()) {
        throw new StorageError('localStorage is not available', 'unavailable')
      }
      localStorage.setItem(key, value)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new StorageError('Storage quota exceeded', 'quota')
      }
      if (error instanceof StorageError) throw error
      throw new StorageError('Failed to write to storage', 'unknown')
    }
  },

  removeItem: (key: string): void => {
    try {
      if (!isStorageAvailable()) return
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to remove item from storage:', error)
    }
  },
}
