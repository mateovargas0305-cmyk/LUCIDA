import { useEffect, useState } from 'react'
import { ScreenHeader } from '../components/ui/ScreenHeader'
import { useModeConfig } from '../modes/modeContext'
import {
  TEXT_SCALE_LABEL,
  usePreferences,
  type TextScaleId,
} from '../preferences/preferencesContext'
import { THEMES, type ThemeId } from '../theme/themes'
import { tpx } from '../lib/typography'
import {
  clearHistory,
  getOverallStats,
  type OverallStats,
} from '../db/sessions'
import { StreakWidget } from '../retention/StreakWidget'
import { PushSettingsWidget } from '../retention/PushSettingsWidget'
import { useNav } from '../navigation/navContext'

const THEME_IDS = Object.keys(THEMES) as ThemeId[]
const TEXT_SCALE_IDS: TextScaleId[] = ['normal', 'grande', 'mas-grande']


function StatsBlock({ stats }: { stats: OverallStats }) {
  const items = [
    { label: 'Racha', value: `${stats.streakDays} días` },
    { label: 'Sesiones', value: String(stats.totalSessions) },
    { label: 'Aciertos', value: `${stats.totalCorrect}/${stats.totalAnswered}` },
  ]
  return (
    <div className="flex gap-2.5">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex-1 rounded-2xl border border-border bg-surface p-3 text-center"
        >
          <div className="font-serif text-[20px] font-bold text-ink-strong">
            {it.value}
          </div>
          <div className="mt-0.5 text-[12px] font-bold text-ink-muted">
            {it.label}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SettingsScreen() {
  const config = useModeConfig()
  const prefs = usePreferences()
  const { navigate } = useNav()
  const [stats, setStats] = useState<OverallStats | null>(null)

  useEffect(() => {
    let alive = true
    void getOverallStats().then((s) => alive && setStats(s))
    return () => {
      alive = false
    }
  }, [])

  const reset = async () => {
    await clearHistory()
    setStats(await getOverallStats())
  }

  return (
    <main
      className="flex flex-1 flex-col px-6 pb-10 pt-8"
      style={{ rowGap: config.controls.blockGapPx }}
    >
      <ScreenHeader title="Ajustes" />

      <section aria-label="Tu progreso">
        <div className="mb-2.5 flex items-baseline justify-between">
          <h2
            className="font-serif font-semibold text-ink-strong"
            style={{ fontSize: tpx(19) }}
          >
            Tu progreso
          </h2>
          <button
            onClick={() => navigate({ name: 'progress' })}
            className="text-[13px] font-bold text-ink-soft"
          >
            Ver todo →
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <StreakWidget context="progress" />
          {stats ? (
            <StatsBlock stats={stats} />
          ) : (
            <p className="text-[14px] text-ink-muted">Cargando…</p>
          )}
        </div>
      </section>

      <section aria-label="Preferencias" className="flex flex-col gap-5">
        <PushSettingsWidget />

        {/* Selector visual de tema: isotipo Lúcida con los colores de cada opción */}
        <div>
          <div className="mb-3 text-[14px] font-bold text-ink-soft">Tema de color</div>
          <div className="flex justify-center gap-4">
            {THEME_IDS.map((id) => {
              const t = THEMES[id]
              const active = id === prefs.theme
              return (
                <button
                  key={id}
                  onClick={() => prefs.setTheme(id)}
                  aria-label={`Tema ${t.name}${active ? ' (activo)' : ''}`}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-2 rounded-2xl p-3 transition-colors ${
                    active
                      ? 'bg-surface shadow-card ring-2 ring-calmo ring-offset-1'
                      : 'bg-transparent'
                  }`}
                >
                  <svg width={52} height={52} viewBox="0 0 28 28" aria-hidden>
                    <circle
                      cx="14"
                      cy="14"
                      r="13"
                      style={{ fill: `rgb(${t.colors.calmo})` }}
                    />
                    <circle
                      cx="18.5"
                      cy="10"
                      r="4.5"
                      style={{ fill: `rgb(${t.colors.agilSoft})` }}
                    />
                  </svg>
                  <span
                    className={`text-[12px] font-bold ${active ? 'text-ink-strong' : 'text-ink-muted'}`}
                  >
                    {t.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[14px] font-bold text-ink-soft">Tamaño del texto</div>
          <div
            role="radiogroup"
            aria-label="Tamaño del texto"
            className="flex items-stretch gap-2 rounded-2xl bg-surface p-1.5"
          >
            {TEXT_SCALE_IDS.map((id) => {
              const active = id === prefs.textScale
              // La "Aa" se muestra en el tamaño que representa: chico, normal, grande.
              const px = ({ normal: 16, grande: 23, 'mas-grande': 30 } as const)[id]
              return (
                <button
                  key={id}
                  role="radio"
                  aria-checked={active}
                  aria-label={TEXT_SCALE_LABEL[id]}
                  onClick={() => prefs.setTextScale(id)}
                  className={`flex flex-1 items-center justify-center rounded-xl px-2 py-3 font-serif font-bold leading-none transition-colors ${
                    active
                      ? 'bg-calmo text-calmo-ink shadow-card'
                      : 'bg-transparent text-ink-soft'
                  }`}
                >
                  <span style={{ fontSize: px }}>Aa</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tres toggles de audio separados */}
        {(
          [
            {
              label: 'Lectura por voz',
              description: 'Lee la pregunta en voz alta (Calmo).',
              value: prefs.soundEnabled,
              toggle: () => prefs.setSoundEnabled(!prefs.soundEnabled),
              ariaLabel: 'Lectura por voz',
            },
            {
              label: 'Efectos de sonido',
              description: 'Sonidos suaves al acertar, errar y cerrar la sesión.',
              value: prefs.soundFxEnabled,
              toggle: () => prefs.setSoundFxEnabled(!prefs.soundFxEnabled),
              ariaLabel: 'Efectos de sonido',
            },
            {
              label: 'Música de fondo',
              description: 'Música ambient en loop, a volumen muy bajo.',
              value: prefs.musicEnabled,
              toggle: () => prefs.setMusicEnabled(!prefs.musicEnabled),
              ariaLabel: 'Música de fondo',
            },
          ] as const
        ).map((item) => (
          <div key={item.ariaLabel} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[14px] font-bold text-ink-soft">{item.label}</div>
              <div className="text-[13px] leading-snug text-ink-muted">{item.description}</div>
            </div>
            <button
              role="switch"
              aria-checked={item.value}
              aria-label={item.ariaLabel}
              onClick={item.toggle}
              className={`relative h-9 w-16 flex-none rounded-pill transition-colors ${
                item.value ? 'bg-sereno' : 'bg-border-strong'
              }`}
            >
              <span
                className={`absolute top-1 h-7 w-7 rounded-full bg-surface shadow-card transition-[left] ${
                  item.value ? 'left-8' : 'left-1'
                }`}
              />
            </button>
          </div>
        ))}
      </section>

      <button
        onClick={reset}
        className="mt-auto min-h-12 rounded-2xl border border-border text-[14px] font-bold text-ink-muted"
      >
        Borrar historial
      </button>
    </main>
  )
}
