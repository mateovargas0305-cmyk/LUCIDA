// Genera los íconos PWA de Lúcida redimensionando la imagen fuente del isotipo.
// La fuente es un PNG cuadrado de fondo liso (crema) con los tres círculos.
// Salida full-bleed y opaca: el sistema operativo aplica su propia máscara,
// así no queda margen negro alrededor.
//
// Uso: node scripts/gen-icons.mjs "<ruta-al-png-fuente>"
import { deflateSync, inflateSync } from 'node:zlib'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = join(here, '..', 'public')
const SOURCE =
  process.argv[2] ?? join(publicDir, 'icon-source.png')

// --- Decodificación PNG (8-bit, color type 2 RGB ó 6 RGBA, sin entrelazar) ---
function decodePNG(buf) {
  let p = 8 // saltar firma
  const idat = []
  let width = 0
  let height = 0
  let channels = 3
  while (p < buf.length) {
    const len = buf.readUInt32BE(p)
    const type = buf.toString('ascii', p + 4, p + 8)
    const data = buf.subarray(p + 8, p + 8 + len)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      const colorType = data[9]
      if (data[8] !== 8) throw new Error('Solo se admite bit depth 8')
      if (colorType === 2) channels = 3
      else if (colorType === 6) channels = 4
      else throw new Error(`Color type no soportado: ${colorType}`)
    } else if (type === 'IDAT') {
      idat.push(Buffer.from(data))
    } else if (type === 'IEND') {
      break
    }
    p += 12 + len
  }
  const raw = inflateSync(Buffer.concat(idat))
  const bpp = channels
  const stride = width * bpp
  const out = Buffer.alloc(stride * height)
  const paeth = (a, b, c) => {
    const pp = a + b - c
    const pa = Math.abs(pp - a)
    const pb = Math.abs(pp - b)
    const pc = Math.abs(pp - c)
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
  }
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    const rowIn = y * (stride + 1) + 1
    const rowOut = y * stride
    for (let i = 0; i < stride; i++) {
      const x = raw[rowIn + i]
      const a = i >= bpp ? out[rowOut + i - bpp] : 0
      const b = y > 0 ? out[rowOut - stride + i] : 0
      const c = y > 0 && i >= bpp ? out[rowOut - stride + i - bpp] : 0
      let v
      switch (filter) {
        case 0: v = x; break
        case 1: v = x + a; break
        case 2: v = x + b; break
        case 3: v = x + ((a + b) >> 1); break
        case 4: v = x + paeth(a, b, c); break
        default: throw new Error(`Filtro PNG desconocido: ${filter}`)
      }
      out[rowOut + i] = v & 0xff
    }
  }
  return { width, height, channels, data: out }
}

// Redimensiona a NxN con promedio de área. Si la fuente tiene alfa, la compone
// sobre crema para mantener el resultado opaco. Devuelve RGB.
const CREAM = [0xf8, 0xf2, 0xe4]
function resizeToRGB(src, size) {
  const { width: W, height: H, channels: C, data } = src
  const out = Buffer.alloc(size * size * 3)
  for (let y = 0; y < size; y++) {
    const y0 = Math.floor((y * H) / size)
    const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * H) / size))
    for (let x = 0; x < size; x++) {
      const x0 = Math.floor((x * W) / size)
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * W) / size))
      let r = 0, g = 0, b = 0, n = 0
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * W + sx) * C
          if (C === 4) {
            const a = data[i + 3] / 255
            r += data[i] * a + CREAM[0] * (1 - a)
            g += data[i + 1] * a + CREAM[1] * (1 - a)
            b += data[i + 2] * a + CREAM[2] * (1 - a)
          } else {
            r += data[i]
            g += data[i + 1]
            b += data[i + 2]
          }
          n++
        }
      }
      const o = (y * size + x) * 3
      out[o] = Math.round(r / n)
      out[o + 1] = Math.round(g / n)
      out[o + 2] = Math.round(b / n)
    }
  }
  return out
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

const src = decodePNG(readFileSync(SOURCE))
console.log(`Fuente: ${src.width}×${src.height} (${src.channels} canales)`)
for (const [name, size] of [
  ['pwa-512.png', 512],
  ['pwa-192.png', 192],
  ['apple-touch-icon.png', 180],
]) {
  writeFileSync(join(publicDir, name), encodePNG(resizeToRGB(src, size), size))
  console.log(`✓ ${name} (${size}×${size})`)
}
