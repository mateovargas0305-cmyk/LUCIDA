import type { ThemeColors } from './tokens'

export type ThemeId = 'tierra' | 'bosque' | 'frio'

export interface Theme {
  id: ThemeId
  name: string
  colors: ThemeColors
}

/**
 * Tema por defecto: "Tierra" — tonos cálidos y orgánicos.
 * Valores tomados del diseño de referencia (Lúcida.dc.html).
 *
 * Nota AAA: en Modo Calmo, el texto sale de `ink`/`inkStrong` sobre
 * `canvas`/`surface`, combinaciones con contraste ≥ 7:1.
 */
const tierra: Theme = {
  id: 'tierra',
  name: 'Tierra',
  colors: {
    canvas: '244 236 221', // #F4ECDD
    surface: '251 245 232', // #FBF5E8
    surfaceRaised: '255 253 246', // #FFFDF6
    border: '231 218 196', // #E7DAC4
    borderStrong: '216 199 168', // #D8C7A8

    ink: '69 56 43', // #45382B
    inkStrong: '52 39 26', // #34271A (titulares, AAA)
    inkSoft: '124 106 87', // #7C6A57
    inkMuted: '138 123 102', // #8A7B66

    agil: '201 154 72', // #C99A48 ocre
    agilStrong: '122 90 18', // #7A5A12
    agilSoft: '241 228 199', // #F1E4C7
    agilInk: '251 245 232', // #FBF5E8 (texto sobre acento)

    sereno: '127 145 115', // #7F9173 salvia
    serenoStrong: '94 113 80', // #5E7150
    serenoSoft: '225 232 215', // #E1E8D7
    serenoInk: '251 245 232',

    calmo: '192 104 72', // #C06848 terracota
    calmoStrong: '168 72 44', // #A8482C
    calmoSoft: '238 221 209', // #EEDDD1
    calmoInk: '251 245 232',

    positive: '127 145 115', // #7F9173
    positiveSoft: '220 229 208', // #DCE5D0
    positiveInk: '61 82 56', // #3D5238
    gentle: '216 199 168', // #D8C7A8
    gentleSoft: '243 234 217', // #F3EAD9
    gentleInk: '110 94 76', // #6E5E4C
  },
}

/**
 * Temas adicionales — listos para activar más adelante.
 * Mantienen la misma estructura: sólo cambian los valores.
 * (Placeholders cálidos por ahora; se afinan en una etapa posterior.)
 */
const bosque: Theme = {
  id: 'bosque',
  name: 'Verde bosque',
  colors: {
    ...tierra.colors,
    agil: '141 156 92',
    agilStrong: '88 102 46',
    agilSoft: '226 232 205',
    sereno: '96 138 110',
    serenoStrong: '58 92 70',
    serenoSoft: '216 230 217',
    calmo: '176 110 64',
    calmoStrong: '128 72 36',
    calmoSoft: '235 222 205',
    // positive armoniza con el verde del tema (igual que sereno en tierra)
    positive: '96 138 110',
    positiveSoft: '216 230 217',
    positiveInk: '44 80 56',
  },
}

const frio: Theme = {
  id: 'frio',
  name: 'Frío sereno',
  colors: {
    ...tierra.colors,
    agil: '120 140 168',
    agilStrong: '64 86 116',
    agilSoft: '218 226 236',
    sereno: '108 150 150',
    serenoStrong: '58 98 98',
    serenoSoft: '214 232 232',
    calmo: '150 118 158',
    calmoStrong: '98 70 108',
    calmoSoft: '230 222 236',
    // positive armoniza con el teal del tema
    positive: '108 150 150',
    positiveSoft: '214 232 232',
    positiveInk: '40 80 80',
  },
}

export const THEMES: Record<ThemeId, Theme> = { tierra, bosque, frio }

export const DEFAULT_THEME_ID: ThemeId = 'tierra'
