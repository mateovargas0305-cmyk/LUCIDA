import { CSS_VAR_BY_TOKEN, type ThemeColors } from './tokens'
import { THEMES, type ThemeId } from './themes'

/** Inyecta los tokens de un tema como CSS custom properties en :root. */
export function applyTheme(id: ThemeId): void {
  const theme = THEMES[id] ?? THEMES.tierra
  const root = document.documentElement
  ;(Object.keys(theme.colors) as Array<keyof ThemeColors>).forEach((token) => {
    root.style.setProperty(CSS_VAR_BY_TOKEN[token], theme.colors[token])
  })
  root.dataset.theme = theme.id
}
