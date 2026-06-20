import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { PreferencesProvider } from './preferences/PreferencesProvider'
import {
  DEFAULT_PREFERENCES,
  TEXT_SCALE_VALUE,
  type Preferences,
} from './preferences/preferencesContext'
import { applyTheme } from './theme/applyTheme'
import { THEMES } from './theme/themes'
import './index.css'

/**
 * Bootstrap síncrono: leemos las preferencias antes del primer render para
 * aplicar tema y escala de texto sin parpadeo. El provider las gobierna luego.
 */
function bootstrapPreferences(): void {
  let prefs: Preferences = DEFAULT_PREFERENCES
  try {
    const raw = localStorage.getItem('lucida.prefs')
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Preferences>
      prefs = {
        theme: parsed.theme && parsed.theme in THEMES ? parsed.theme : prefs.theme,
        soundEnabled:
          typeof parsed.soundEnabled === 'boolean'
            ? parsed.soundEnabled
            : prefs.soundEnabled,
        textScale: parsed.textScale ?? prefs.textScale,
      }
    }
  } catch {
    // Sin almacenamiento: usamos los valores por defecto.
  }
  applyTheme(prefs.theme)
  document.documentElement.style.setProperty(
    '--text-scale',
    String(TEXT_SCALE_VALUE[prefs.textScale] ?? 1),
  )
}

bootstrapPreferences()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PreferencesProvider>
      <App />
    </PreferencesProvider>
  </React.StrictMode>,
)
