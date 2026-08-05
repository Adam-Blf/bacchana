import { Component, type ErrorInfo, type ReactNode } from 'react'
import { consumeReloadAllowance, isStaleChunkError } from '@/utils'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  /** Vrai le temps du rechargement automatique apres un deploiement. */
  recovering: boolean
}

/** Global error boundary - recovery screen instead of a white page mid-party. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, recovering: false }

  static getDerivedStateFromError(error: Error): State {
    // On distingue des le premier rendu le vrai defaut de la simple version
    // perimee, pour ne pas afficher un message de plantage a quelqu'un dont
    // l'application est en train de se reparer seule.
    return { hasError: true, recovering: isStaleChunkError(error) }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isStaleChunkError(error)) {
      // Version perimee : un deploiement a remplace les fichiers haches que cet
      // onglet demande encore. Ce n'est pas un defaut applicatif, on ne pollue
      // donc pas la console d'erreurs avec le bruit de chaque mise en ligne.
      if (consumeReloadAllowance(sessionStorage)) {
        window.location.reload()
        return
      }
      // Credit epuise : deux echecs de suite ne sont plus une fenetre de
      // deploiement. On rend la main a l'ecran d'erreur plutot que de boucler.
      this.setState({ recovering: false })
      return
    }

    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ hasError: false, recovering: false })
    window.location.assign('/')
  }

  render() {
    if (this.state.recovering) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center gap-4 bg-bg text-ink px-6 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="font-display text-2xl uppercase tracking-tight">Nouvelle version</p>
          <p className="text-ink-secondary max-w-sm font-sans">
            L&apos;application se met à jour, un instant.
          </p>
        </div>
      )
    }

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
