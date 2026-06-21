import { useCallback, useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { useMode } from '../modes/modeContext'
import { ACCENT } from '../lib/accent'
import { tpx } from '../lib/typography'
import { useRetentionConfig } from './useRetentionConfig'
import { usePushPrefs } from './usePushPrefs'
import {
  showDemoNotification,
  onNotificationsEnabled,
  onNotificationsDisabled,
} from './pushNotifications'

type PermissionState = 'unsupported' | 'default' | 'granted' | 'denied'

function getPermission(): PermissionState {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission as PermissionState
}

// ── Toggle reutilizable ──────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  disabled,
  ariaLabel,
  activeBg,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  ariaLabel: string
  activeBg: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      disabled={disabled}
      className={`relative h-9 w-16 flex-none rounded-pill transition-colors disabled:opacity-40 ${
        checked ? activeBg : 'bg-border-strong'
      }`}
    >
      <span
        className={`absolute top-1 h-7 w-7 rounded-full bg-surface shadow-card transition-[left] ${
          checked ? 'left-8' : 'left-1'
        }`}
      />
    </button>
  )
}

// ── Widget principal ─────────────────────────────────────────────────────────

export function PushSettingsWidget() {
  const { config } = useMode()
  const retention = useRetentionConfig()
  const { prefs, update } = usePushPrefs()
  const [permission, setPermission] = useState<PermissionState>(getPermission)
  const [requestingPermission, setRequestingPermission] = useState(false)

  const accent = ACCENT[config.accent]
  const tone = retention.push.tone

  // Sincroniza si el usuario cambia el permiso desde los ajustes del navegador.
  useEffect(() => {
    if (!('permissions' in navigator)) return
    let alive = true
    navigator.permissions
      .query({ name: 'notifications' as PermissionName })
      .then((status) => {
        const sync = () => alive && setPermission(status.state as PermissionState)
        status.addEventListener('change', sync)
        return () => status.removeEventListener('change', sync)
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const handleToggle = useCallback(async () => {
    if (permission === 'unsupported') return

    if (permission === 'default') {
      setRequestingPermission(true)
      const result = await Notification.requestPermission()
      setRequestingPermission(false)
      setPermission(result as PermissionState)
      if (result === 'granted') {
        update({ enabled: true })
        await onNotificationsEnabled(tone)
        await showDemoNotification(tone)
      }
      return
    }

    if (permission === 'granted') {
      const next = !prefs.enabled
      update({ enabled: next })
      if (next) {
        await onNotificationsEnabled(tone)
        await showDemoNotification(tone)
      } else {
        await onNotificationsDisabled()
      }
    }
  }, [permission, prefs.enabled, tone, update])

  const handleTimeChange = useCallback(
    async (time: string) => {
      update({ time })
      // Actualiza el cache del SW con el cuerpo de notificación correcto.
      await onNotificationsEnabled(tone)
    },
    [tone, update],
  )

  // ── No soportado ────────────────────────────────────────────────────────────

  if (permission === 'unsupported') {
    return (
      <div className="flex items-start gap-3 opacity-50">
        <BellOff size={18} className="mt-0.5 flex-none text-ink-muted" aria-hidden />
        <div>
          <div className="text-[14px] font-bold text-ink-soft">Recordatorio diario</div>
          <div className="text-[13px] leading-snug text-ink-muted">
            Tu navegador no soporta notificaciones.
          </div>
        </div>
      </div>
    )
  }

  // ── Permiso denegado ────────────────────────────────────────────────────────

  if (permission === 'denied') {
    return (
      <div className="flex items-start gap-3">
        <BellOff size={18} className="mt-0.5 flex-none text-ink-muted" aria-hidden />
        <div className="min-w-0">
          <div className="text-[14px] font-bold text-ink-soft">Recordatorio diario</div>
          <div className="mt-0.5 text-[13px] leading-snug text-ink-muted">
            Notificaciones bloqueadas. Podés habilitarlas en los ajustes de tu navegador y volver acá.
          </div>
        </div>
      </div>
    )
  }

  // ── Permiso por pedir o ya concedido ────────────────────────────────────────

  const isOn = permission === 'granted' && prefs.enabled

  return (
    <div className="flex flex-col gap-4">
      {/* Fila de toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Bell size={18} className={`flex-none ${isOn ? accent.strongText : 'text-ink-muted'}`} aria-hidden />
          <div className="min-w-0">
            <div
              className="font-bold text-ink-soft"
              style={{ fontSize: tpx(14) }}
            >
              Recordatorio diario
            </div>
            {permission === 'default' && !requestingPermission && (
              <div className="mt-0.5 text-[13px] leading-snug text-ink-muted">
                Te avisamos cuando llegue tu momento.
              </div>
            )}
            {requestingPermission && (
              <div className="mt-0.5 text-[13px] text-ink-muted">Esperando permiso…</div>
            )}
          </div>
        </div>
        <Toggle
          checked={isOn}
          onChange={handleToggle}
          disabled={requestingPermission}
          ariaLabel={isOn ? 'Desactivar recordatorio diario' : 'Activar recordatorio diario'}
          activeBg={accent.solidBg}
        />
      </div>

      {/* Selector de horario (solo cuando está activo) */}
      {isOn && (
        <div className="flex items-center justify-between gap-4 pl-9">
          <label
            htmlFor="push-time"
            className="text-[14px] font-bold text-ink-soft"
          >
            Horario
          </label>
          <input
            id="push-time"
            type="time"
            value={prefs.time}
            onChange={(e) => void handleTimeChange(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-[15px] font-bold text-ink-strong"
            aria-label="Horario del recordatorio"
          />
        </div>
      )}
    </div>
  )
}
