import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/** Global error boundary - recovery screen instead of a white page mid-party. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.assign('/')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-bg text-ink px-6 text-center">
          <p className="font-display text-2xl uppercase tracking-tight">Oups, la partie a plante.</p>
          <p className="text-ink-secondary max-w-sm font-sans">
            Une erreur inattendue est survenue. Relance l&apos;application pour reprendre la
            soirée - il faudra ressaisir la tablée.
          </p>
          <button
            onClick={this.handleReload}
            className="min-h-[44px] px-6 py-3 rounded-pill bg-neon text-tile-ink font-semibold focus-ring-neon"
          >
            Relancer l&apos;application
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
