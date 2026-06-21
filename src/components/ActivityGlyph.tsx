import {
  BookOpen,
  Hash,
  LayoutGrid,
  Eye,
  Repeat2,
  Link2,
  Type,
  Zap,
} from 'lucide-react'
import type { ActivityId } from '../modes/types'

interface ActivityGlyphProps {
  id: ActivityId
  size?: number
}

export function ActivityGlyph({ id, size = 26 }: ActivityGlyphProps) {
  const props = { size, 'aria-hidden': true } as const
  switch (id) {
    case 'quiz':        return <BookOpen {...props} />
    case 'calc':        return <Hash {...props} />
    case 'memory':      return <LayoutGrid {...props} />
    case 'attention':   return <Eye {...props} />
    case 'sequence':    return <Repeat2 {...props} />
    case 'chainedCalc': return <Link2 {...props} />
    case 'stroop':      return <Type {...props} />
    case 'symbolSpeed': return <Zap {...props} />
  }
}
