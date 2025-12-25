import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (could send to error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-red-900 to-gray-900">
          <div className="glass-dark rounded-3xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-300 mb-6">
              Don't worry! Your pets are safe. Try reloading the app.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 bg-black/30 rounded-xl text-left overflow-auto max-h-32">
                <p className="text-xs text-red-300 font-mono break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl font-bold text-white shadow-lg btn-3d hover:scale-[1.02] transition-transform"
              >
                🔄 Reload App
              </button>

              <button
                onClick={this.handleReset}
                className="w-full py-2 text-gray-400 hover:text-white transition"
              >
                Try Again Without Reload
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              If this keeps happening, try clearing your browser cache
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
