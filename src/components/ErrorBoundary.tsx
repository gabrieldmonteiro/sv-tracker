import { Component, type ErrorInfo, type ReactNode } from 'react'
import { DICTIONARIES, matchLanguage } from '@/i18n'
import { loadLanguage } from '@/lib/storage'

interface State {
  error: Error | null
}

/** Last-resort fallback; deliberately avoids context so it still renders if a provider failed. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Trophy tracker crashed', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    const language = loadLanguage() ?? matchLanguage(navigator.language)
    const { ui } = DICTIONARIES[language]
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="font-heading text-2xl">{ui.errorTitle}</h1>
        <p className="text-muted-foreground">{ui.errorBody}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {ui.reload}
        </button>
      </main>
    )
  }
}
