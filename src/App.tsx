import { ErrorBoundary } from '@/components/ErrorBoundary'
import { TrackerPage } from '@/components/TrackerPage'
import { I18nProvider } from '@/hooks/useLanguage'

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <TrackerPage />
      </I18nProvider>
    </ErrorBoundary>
  )
}
