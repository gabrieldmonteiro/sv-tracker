import { Languages } from 'lucide-react'
import { useI18n } from '@/hooks/useLanguage'
import { isLanguage, LANGUAGES } from '@/i18n'

export function LanguageSelector() {
  const { language, setLanguage, t } = useI18n()

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-select" className="flex items-center gap-1.5 text-sm font-medium">
        <Languages className="size-4 text-wood" aria-hidden="true" />
        <span>{t('languageLabel')}</span>
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(event) => {
          if (isLanguage(event.target.value)) setLanguage(event.target.value)
        }}
        className="h-9 rounded-md border-2 border-input bg-card px-2 text-sm font-medium outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {LANGUAGES.map((option) => (
          <option key={option.code} value={option.code} lang={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
