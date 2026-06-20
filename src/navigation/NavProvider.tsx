import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { NavContext, type NavContextValue, type Screen } from './navContext'

export function NavProvider({
  initial,
  children,
}: {
  initial: Screen
  children: ReactNode
}) {
  const [stack, setStack] = useState<Screen[]>([initial])

  const navigate = useCallback((screen: Screen) => {
    setStack((s) => [...s, screen])
  }, [])

  const back = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))
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
