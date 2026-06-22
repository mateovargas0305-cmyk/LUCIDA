// Genera los íconos PWA de Lúcida a partir de la definición vectorial del isotipo.
// Full-bleed, opaco (sin esquinas redondeadas ni transparencia): el sistema
// operativo aplica su propia máscara, así no queda margen negro alrededor.
//
// Uso: node scripts/gen-icons.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = join(here, '..', 'public')

// Paleta (debe coincidir con favicon.svg / tokens del tema "tierra").
const CREAM = [0xf8, 0xf2, 0xe4]
const CIRCLES = [
  { cx: 40, cy: 52, r: 26, color: [0xe8, 0xb8, 0x40] }, // dorado
  { cx: 60, cy: 40, r: 26, color: [0xc8, 0x5a, 0x3a] }, // terracota
  { cx: 54, cy: 64, r: 24, color: [0x7a, 0x9e, 0x74] }, // verde salvia
]

// Coverage suavizado (~1.2 u de antialias) en la coordenada del lienzo 0..100.
function coverage(d, r, edge) {
  if (d <= r - edge) return 1
  if (d >= r + edge) return 0
  return 1 - (d - (r - edge)) / (2 * edge)
}

function renderRGB(size) {
  const buf = Buffer.alloc(size * size * 3)
  const scale = 100 / size
  for (let y = 0; y < size; y++) {
    const uy = (y + 0.5) * scale
    for (let x = 0; x < size; x++) {
      const ux = (x + 0.5) * scale
      // Multiply: final = cream * prod(lerp(1, color/255, coverage)) por canal.
      const f = [1, 1, 1]
      for (const c of CIRCLES) {
        const d = Math.hypot(ux - c.cx, uy - c.cy)
        const cov = coverage(d, c.r, 1.2 * scale)
        if (cov <= 0) continue
        for (let k = 0; k < 3; k++) {
          const factor = c.color[k] / 255
          f[k] *= 1 - cov + cov * factor
        }
      }
      const i = (y * size + x) * 3
      buf[i] = Math.round(CREAM[0] * f[0])
      buf[i + 1] = Math.round(CREAM[1] * f[1])
      buf[i + 2] = Math.round(CREAM[2] * f[2])
    }
  }
  return buf
}

// --- Codificación PNG mínima (RGB, 8 bits, opaco) ---
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}
function encodePNG(rgb, size) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type RGB
  // 10,11,12 = 0 (deflate / filtro adaptativo / sin entrelazado)
  const stride = size * 3
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0 // filtro None
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const [name, size] of [
  ['pwa-512.png', 512],
  ['pwa-192.png', 192],
  ['apple-touch-icon.png', 180],
]) {
  writeFileSync(join(publicDir, name), encodePNG(renderRGB(size), size))
  console.log(`✓ ${name} (${size}×${size})`)
}
