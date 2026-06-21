import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { PreferencesProvider } from './preferences/PreferencesProvider'
import { DEFAULT_PREFERENCES, TEXT_SCALE_VALUE } from './preferences/preferencesContext'
import { applyTheme } from './theme/applyTheme'
import { THEMES } from './theme/themes'
import './index.css'

/**
 * Bootstrap síncrono: aplica tema y escala de texto antes del primer render
 * para evitar el parpadeo. Solo lee theme y textScale (son los únicos valores
 * necesarios antes de que React monte el árbol).
 */
function bootstrapPreferences(): void {
  try {
    const raw = localStorage.getItem('lucida.prefs')
    if (!raw) return
    const v = JSON.parse(raw) as Record<string, unknown>
    const theme =
      typeof v.theme === 'string' && v.theme in THEMES
        ? v.theme
        : DEFAULT_PREFERENCES.theme
    const textScale =
      v.textScale === 'normal' || v.textScale === 'grande' || v.textScale === 'mas-grande'
        ? v.textScale
        : DEFAULT_PREFERENCES.textScale
    applyTheme(theme as keyof typeof THEMES)
    document.documentElement.style.setProperty(
      '--text-scale',
      String(TEXT_SCALE_VALUE[textScale] ?? 1),
    )
  } catch {
    // Sin almacenamiento: usamos los valores por defecto.
  }
}

bootstrapPreferences()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PreferencesProvider>
      <App />
    </PreferencesProvider>
  </React.StrictMode>,
)
