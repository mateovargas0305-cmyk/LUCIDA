import type { ModeId } from '../modes/types'
import type { RetentionConfig } from './types'

const agilRetention: RetentionConfig = {
  mode: 'agil',
  streak: {
    visible: true,
    prominence: 'high',
    showOnOpen: true,
    resetTone: 'neutral',
  },
  trend: 'performance',
  dailySession: {
    count: 3,
    framing: 'challenge',
  },
  push: {
    defaultOn: false,
    tone: 'motivator',
  },
}

const serenoRetention: RetentionConfig = {
  mode: 'sereno',
  streak: {
    visible: true,
    prominence: 'low',
    showOnOpen: false,
    resetTone: 'silent',
  },
  trend: 'consistency',
  dailySession: {
    count: 2,
    framing: 'routine',
  },
  push: {
    defaultOn: false,
    tone: 'neutral',
  },
}

const calmoRetention: RetentionConfig = {
  mode: 'calmo',
  streak: {
    visible: true,
    // 'minimal' = "Jugaste hoy ✓", sin número ni días. Solo en vista de progreso.
    prominence: 'minimal',
    showOnOpen: false,
    resetTone: 'silent',
  },
  trend: 'participation',
  dailySession: {
    count: 1,
    framing: 'invitation',
  },
  push: {
    defaultOn: false,
    tone: 'care',
  },
}

export const RETENTION_CONFIGS: Record<ModeId, RetentionConfig> = {
  agil: agilRetention,
  sereno: serenoRetention,
  calmo: calmoRetention,
}
