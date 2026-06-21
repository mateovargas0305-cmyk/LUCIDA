import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { NavContext, type NavContextValue, type Screen } from './navContext'

export function NavProvider({
  initial,
  children,
}: {
  initial: Screen
  children: ReactNode
}) {
  const [stack, setStack] = useState<Screen[]>([initial])
  const stackRef = useRef(stack)
  useEffect(() => { stackRef.current = stack }, [stack])

  // Sincroniza el History API del navegador para que el botón/gesto de volver
  // de Android y iOS (PWA) navegue dentro de la app en lugar de salir.
  const ignoringPopState = useRef(false)

  useEffect(() => {
    // Siembra una entrada inicial para que el primer "atrás" no salga de la app.
    window.history.pushState({ lucida: true }, '')

    const onPopState = () => {
      if (ignoringPopState.current) {
        ignoringPopState.current = false
        return
      }
      if (stackRef.current.length > 1) {
        setStack((s) => s.slice(0, -1))
        // Re-empuja para que haya siempre una entrada disponible para el próximo "atrás".
        window.history.pushState({ lucida: true }, '')
      }
      // Si stack.length === 1 (pantalla inicio): dejamos que el navegador salga o vuelva al origen.
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((screen: Screen) => {
    setStack((s) => [...s, screen])
    window.history.pushState({ lucida: true }, '')
  }, [])

  const back = useCallback(() => {
    setStack((s) => {
      if (s.length <= 1) return s
      ignoringPopState.current = true
      window.history.back() // sincroniza browser history; el popstate resultante se ignora
      return s.slice(0, -1)
    })
  }, [])

  const value = useMemo<NavContextValue>(
    () => ({
      screen: stack[stack.length - 1],
      navigate,
      back,
      canGoBack: stack.length > 1,
    }),
    [stack, navigate, back],
  )

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}
