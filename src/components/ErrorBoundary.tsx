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
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-velvet-deep text-ivory px-6 text-center">
          <p className="text-2xl font-bold">Oups, la partie a planté.</p>
          <p className="text-text-secondary max-w-sm">
            Une erreur inattendue est survenue. Tes joueurs sont sauvegardés, tu peux relancer.
          </p>
          <button
            onClick={this.handleReload}
            className="min-h-[44px] px-6 py-3 rounded-full bg-gold text-velvet-deep font-semibold"
          >
            Relancer l'application
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
