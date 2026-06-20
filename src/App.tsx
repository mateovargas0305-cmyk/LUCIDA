import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AppShell } from './components/layout/AppShell'
import { ModeProvider } from './modes/ModeProvider'
import { NavProvider } from './navigation/NavProvider'
import { useNav, type Screen } from './navigation/navContext'
import { ModeSelectScreen } from './screens/ModeSelectScreen'
import { HomeScreen } from './screens/HomeScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { QuizScreen } from './activities/quiz/QuizScreen'
import { CalcScreen } from './activities/calc/CalcScreen'
import { MemoryScreen } from './activities/memory/MemoryScreen'
import { AttentionScreen } from './activities/attention/AttentionScreen'
import { SequenceScreen } from './activities/sequence/SequenceScreen'
import { ChainedCalcScreen } from './activities/chained-calc/ChainedCalcScreen'
import type { ActivityId } from './modes/types'
import { screenEnter } from './lib/motion'

/**
 * Atajo SÓLO de desarrollo: `?mode=calmo&start=home` siembra el modo y la
 * pantalla inicial para inspeccionar estados sin clics. No corre en producción.
 */
if (import.meta.env.DEV) {
  const params = new URLSearchParams(location.search)
  const seedMode = params.get('mode')
  if (seedMode) localStorage.setItem('lucida.mode', JSON.stringify(seedMode))
}

/** Primera pantalla: selección de modo si nunca se eligió; si no, el inicio. */
function initialScreen(): Screen {
  if (import.meta.env.DEV) {
    const start = new URLSearchParams(location.search).get('start')
    if (start === 'home') return { name: 'home' }
    if (start === 'settings') return { name: 'settings' }
    if (
      start === 'quiz' || start === 'calc' || start === 'memory' ||
      start === 'attention' || start === 'sequence' || start === 'chainedCalc'
    ) {
      return { name: 'activity', activity: start }
    }
  }
  const hasMode = (() => {
    try {
      return localStorage.getItem('lucida.mode') !== null
    } catch {
      return false
    }
  })()
  return hasMode ? { name: 'home' } : { name: 'mode-select' }
}

/** Clave estable por pantalla para que AnimatePresence anime las transiciones. */
function screenKey(screen: Screen): string {
  return screen.name === 'activity'
    ? `activity:${screen.activity}`
    : screen.name
}

/** Despacha cada actividad a su pantalla. Las pendientes usan el placeholder. */
function ActivityScreen({ activity }: { activity: ActivityId }) {
  switch (activity) {
    case 'quiz':
      return <QuizScreen />
    case 'calc':
      return <CalcScreen />
    case 'memory':
      return <MemoryScreen />
    case 'attention':
      return <AttentionScreen />
    case 'sequence':
      return <SequenceScreen />
    case 'chainedCalc':
      return <ChainedCalcScreen />
  }
}

function CurrentScreen() {
  const { screen } = useNav()
  const reduce = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={screenKey(screen)}
        className="flex min-h-full flex-1 flex-col"
        initial={reduce ? false : screenEnter.initial}
        animate={screenEnter.animate}
        exit={reduce ? { opacity: 0 } : screenEnter.exit}
        transition={{ duration: 0.32, ease: 'easeOut' }}
      >
        {screen.name === 'mode-select' && <ModeSelectScreen />}
        {screen.name === 'home' && <HomeScreen />}
        {screen.name === 'settings' && <SettingsScreen />}
        {screen.name === 'activity' && <ActivityScreen activity={screen.activity} />}
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ModeProvider>
      <NavProvider initial={initialScreen()}>
        <AppShell>
          <CurrentScreen />
        </AppShell>
      </NavProvider>
    </ModeProvider>
  )
}
